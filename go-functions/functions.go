package functions

import (
	"encoding/json"
	"github.com/gitchander/permutation"
	"log"
	"math/rand"
	"net/http"
	"sync"
)

type Team struct {
	WinPct float32 `json:"winPct"`
}

type Game struct {
	Id string `json:"id"`
	Home string `json:"home"`
	Away string `json:"away"`
	Teams map[string]Team `json:"teams"`
	Winner *string `json:"winner"`
}

type Pick struct {
	Pick string `json:"pick"`
	Weight int `json:"weight"`
}

type Picks map[string]map[string]Pick

type SimBody struct {
	Games []Game `json:"games"`
	Picks Picks `json:"picks"`
	NumSims int `json:"numSims"`
}

type Response struct {
	WinPcts map[string]float32 `json:"winPcts"`
	Scores map[string]int `json:"scores"`
}

func setUpRequest(r *http.Request, w http.ResponseWriter) {
	if r.Method != http.MethodPost && r.Method != http.MethodOptions {
		http.Error(w, "405 - Method Not Allowed", http.StatusMethodNotAllowed)
		return
	}

	// Set CORS headers for the preflight request
	if r.Method == http.MethodOptions {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "POST")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
		w.Header().Set("Access-Control-Max-Age", "3600")
		w.WriteHeader(http.StatusNoContent)
		return
	}
	// Set CORS headers for the main request
	w.Header().Set("Access-Control-Allow-Origin", "*")
}

func Simulate(w http.ResponseWriter, r *http.Request) {
	setUpRequest(r, w)

	var body SimBody
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error parsing request body", http.StatusBadRequest)
		return
	}

	// Generate list of players
	players := make([]string, len(body.Picks))
	p := 0
	for k := range body.Picks {
		players[p] = k
		p++
	}

	scores := calculateScores(body.Games, body.Picks, players)

	winPcts := doSimulations(body.Games, body.Picks, players, body.NumSims)

	response := Response{
		Scores: scores,
		WinPcts: winPcts,
	}

	w.Header().Set("Content-Type", "application/json")
	jsonBody, err := json.Marshal(response)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error building response body", http.StatusInternalServerError)
		return
	}

	_, err = w.Write(jsonBody)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error sending response", http.StatusInternalServerError)
	}
}

type RankInfo struct {
	gameId string
	pick string
	rank int
}

type RankBody struct {
	Games []Game `json:"games"`
	Picks Picks `json:"picks"`
	User string `json:"user"`
	NumSims int `json:"num_sims"`
	NumRanks int `json:"num_ranks"`
}

type SimResult struct {
	winPct float32
	picks map[string]Pick
}

type RankResponse struct {
	WinPct float32 `json:"win_pct"`
	Rankings map[string]int `json:"rankings"`
}

func AutoRank(w http.ResponseWriter, r *http.Request) {
	setUpRequest(r, w)

	var body RankBody
	err := json.NewDecoder(r.Body).Decode(&body)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error parsing request body", http.StatusBadRequest)
		return
	}

	// Generate list of players
	players := make([]string, len(body.Picks))
	p := 0
	for k := range body.Picks {
		players[p] = k
		p++
	}

	var (
		mu sync.Mutex
		results []SimResult
	)

	results = make([]SimResult, body.NumRanks)

	var wg sync.WaitGroup
	wg.Add(body.NumRanks)

	var pickOptions []int

	for i := 1; i <= len(body.Games); i++ {
		pickOptions = append(pickOptions, i)
	}

	for i := 0; i < body.NumRanks; i++ {
		go func (picksArr []int, picks Picks, index int) {
			defer wg.Done()

			picksArrCopy := make([]int, len(picksArr))
			copy(picksArrCopy, picksArr)

			picksCopy := copyPicks(picks)

			for _, game := range body.Games {
				randomIndex := rand.Intn(len(picksArrCopy))
				weight := picksArrCopy[randomIndex]
				picksArrCopy = remove(picksArrCopy, randomIndex)
				picksCopy[body.User][game.Id] = Pick{
					Pick: picksCopy[body.User][game.Id].Pick,
					Weight: weight,
				}
			}

			winPcts := doSimulations(body.Games, picksCopy, players, body.NumSims)
			mu.Lock()
			result := SimResult{
				picks: picksCopy[body.User],
				winPct: winPcts[body.User],
			}
			results[index] = result
			mu.Unlock()
		}(pickOptions, body.Picks, i)
	}

	wg.Wait()

	maxWinPct := float32(0)
	var bestPicks map[string]Pick
	for _, result := range results {
		if result.winPct > maxWinPct {
			bestPicks = result.picks
			maxWinPct = result.winPct
		}
	}

	rankings := make(map[string]int)

	for _, pick := range bestPicks {
		rankings[pick.Pick] = pick.Weight
	}

	response := RankResponse{
		WinPct: maxWinPct,
		Rankings: rankings,
	}

	w.Header().Set("Content-Type", "application/json")
	jsonBody, err := json.Marshal(response)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error building response body", http.StatusInternalServerError)
		return
	}

	_, err = w.Write(jsonBody)
	if err != nil {
		log.Println(err)
		http.Error(w, "Error sending response", http.StatusInternalServerError)
	}
}

func remove(s []int, i int) []int {
	s[i] = s[len(s)-1]
	return s[:len(s)-1]
}

func copyPicks(picks Picks) Picks {
	pickCopy := make(Picks)
	for key, val := range picks {
		pickCopy[key] = copyMap(val)
	}
	return pickCopy
}

func copyMap(src map[string]Pick) map[string]Pick {
	pickCopy := make(map[string]Pick)
	for key, val := range src {
		pickCopy[key] = val
	}
	return pickCopy
}

func calculateScores(games []Game, picks Picks, players []string) map[string]int {
	scores := make(map[string]int)
	for _, player := range players {
		scores[player] = 0
	}

	for _, game := range games {
		if game.Winner != nil {
			for _, player := range players {
				pick := picks[player][game.Id]
				if pick.Pick == *game.Winner {
					scores[player] += pick.Weight
				}
			}
		}
	}

	return scores
}

func doSimulations(games []Game, picks Picks, players []string, numSims int) map[string]float32 {
	var (
		mu sync.Mutex
		wins map[string]float32
	)

	wins = make(map[string]float32)
	for _, player := range players {
		wins[player] = 0
	}

	var wg sync.WaitGroup
	wg.Add(numSims)

	for i := 0; i < numSims; i++ {
		go func () {
			defer wg.Done()
			winners := doSimulation(games, picks, players)
			mu.Lock()
			for _, winner := range winners {
				wins[winner] += 1 / float32(len(winners))
			}
			mu.Unlock()
		}()
	}

	wg.Wait()

	winPcts := make(map[string]float32)
	for _, player := range players {
		if wins[player] == 0 {
			winPcts[player] = 0
		} else {
			winPcts[player] = wins[player] / float32(numSims)
		}
	}

	return winPcts
}

func doSimulation(games []Game, picks Picks, players []string) []string {
	scores := make([]int, len(players))
	for i := 0; i < len(scores); i++ {
		scores[i] = 0
	}

	for _, game := range games {
		homeTeam := game.Home
		awayTeam := game.Away

		var winningTeam string

		if game.Winner != nil {
			winningTeam = *game.Winner
		} else {
			random := rand.Float32()
			if game.Teams[homeTeam].WinPct >= random {
				winningTeam = homeTeam
			} else {
				winningTeam = awayTeam
			}
		}

		for i, player := range players {
			pick := picks[player][game.Id]
			if pick.Pick == winningTeam {
				scores[i] += pick.Weight
			}
		}
	}

	maxScore := -1
	for i := 0; i < len(scores); i++ {
		if scores[i] > maxScore {
			maxScore = scores[i]
		}
	}

	winners := make([]string, 0)

	for i := 0; i < len(scores); i++ {
		if scores[i] == maxScore {
			winners = append(winners, players[i])
		}
	}

	return winners
}

// Deprecated: takes way too long to generate permutations
func createPermutations(picks Picks, user string) []Picks {
	userPicks := picks[user]
	var picksArr []RankInfo
	for game, pick := range userPicks {
		pickInfo := RankInfo{
			gameId: game,
			pick: pick.Pick,
			rank: pick.Weight,
		}
		picksArr = append(picksArr, pickInfo)
	}

	perms := permutation.New(permutation.MustAnySlice(picksArr))
	var newPicks []Picks

	log.Println("Generated perm array, looping...")

	curr := 0
	for perms.Next() {
		log.Println(curr)
		pickMap := make(map[int]int)
		for i, pickInfo := range picksArr {
			pickMap[pickInfo.rank] = i
		}

		picksPerm := picks
		for _, pick := range picksArr {
			existingPick := picksPerm[user][pick.gameId]
			picksPerm[user][pick.gameId] = Pick{
				Pick: existingPick.Pick,
				Weight: pickMap[existingPick.Weight],
			}
		}

		newPicks = append(newPicks, picksPerm)
		curr += 1
	}

	return newPicks
}
