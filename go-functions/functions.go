package functions

import (
	"encoding/json"
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

func Simulate(w http.ResponseWriter, r *http.Request) {
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
	// Set CORS headers for the main request.
	w.Header().Set("Access-Control-Allow-Origin", "*")

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

	wins := make(map[string]float32)
	for _, player := range players {
		wins[player] = 0
	}

	var wg sync.WaitGroup
	wg.Add(body.NumSims)

	for i := 0; i < body.NumSims; i++ {
		go func () {
			defer wg.Done()
			winners := doSimulation(body.Games, body.Picks, players)
			for _, winner := range winners {
				wins[winner] += 1 / float32(len(winners))
			}
		}()
	}

	wg.Wait()

	winPcts := make(map[string]float32)
	for _, player := range players {
		if wins[player] == 0 {
			winPcts[player] = 0
		} else {
			winPcts[player] = wins[player] / float32(body.NumSims)
		}
	}

	w.Header().Set("Content-Type", "application/json")
	jsonBody, err := json.Marshal(winPcts)
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

func doSimulation(games []Game, picks Picks, players []string) []string {
	scores := make([]int, len(players))
	for i := 0; i < len(scores); i++ {
		scores[i] = 0
	}

	for _, game := range games {
		homeTeam := game.Home
		awayTeam := game.Away

		random := rand.Float32()

		var winningTeam string

		if game.Teams[homeTeam].WinPct >= random {
			winningTeam = homeTeam
		} else {
			winningTeam = awayTeam
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
