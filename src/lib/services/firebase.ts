import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs } from 'firebase/firestore'
import type { Timestamp } from 'firebase/firestore'
import { has } from 'lodash-es'

export type Picks = {
    [player: string]: {
        [gameId: string]: {
            pick: string,
            weight: number
        }
    }
}

const firebaseConfig = {
    apiKey: 'AIzaSyBWzWqAPP_HGNxeMD2eAl7AsLBpKxVo8Kw',
    authDomain: 'nfl-pickems-5e76c.firebaseapp.com',
    databaseURL: 'https://nfl-pickems-5e76c.firebaseio.com',
    projectId: 'nfl-pickems-5e76c',
    storageBucket: 'nfl-pickems-5e76c.appspot.com',
    messagingSenderId: '776648999019',
    appId: '1:776648999019:web:6aea3b0d024c061994f12e'
}

initializeApp(firebaseConfig)

export const getSubmissionLock = async () => {
    const db = getFirestore()
    const snapshot = await getDocs(collection(db, 'weeks'))
    const submissionLock: Timestamp = snapshot.docs[snapshot.size - 1].get('submissionLock')
    return submissionLock.toMillis()
}

export const getPlayers = async () => {
    const db = getFirestore()
    const snapshot = await getDocs(collection(db, 'players'))
    return snapshot.docs.map(doc => doc.id)
}

export const getGameIds = async (week?: number) => {
    const db = getFirestore()
    const snapshot = await getDocs(collection(db, 'weeks'))
    const currentWeek = snapshot.docs[week ? week - 1 : snapshot.size - 1].ref
    const gamesSnapshot = await getDocs(collection(currentWeek, 'games'))
    return gamesSnapshot.docs.map(doc => doc.id)
}

export const getPicks = async (week?: number) => {
    const picks: Picks = {}

    const db = getFirestore()
    const snapshot = await getDocs(collection(db, 'weeks'))
    const currentWeek = snapshot.docs[week ? week - 1 : snapshot.size - 1].ref
    const gamesSnapshot = await getDocs(collection(currentWeek, 'games'))
    const games = gamesSnapshot.docs.map(doc => doc.ref)

    const promises = []
    for (const game of games) {
        promises.push(getDocs(collection(game, 'picks')).then((snapshot) => {
            snapshot.forEach((doc) => {
                const data = doc.data()
                if (!has(picks, doc.id)) {
                    picks[doc.id] = {}
                }
                picks[doc.id][game.id] = {
                    pick: data.pick,
                    weight: data.weight
                }
            })
        }))
    }

    await Promise.all(promises)
    return picks
}
