import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, getDoc, doc, setDoc } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth'
import type { UserInfo } from 'firebase/auth'
import type { Timestamp } from 'firebase/firestore'
import { has } from 'lodash-es'
import { user } from '$lib/stores/user'

export type Picks = {
    [player: string]: PlayerPicks
}

export type PlayerPicks = {
    [gameId: string]: {
        pick: string,
        weight: number
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

export const isLoggedIn = () => {
    const auth = getAuth()
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth, (u) => {
            unsubscribe()
            if (u) {
                user.set(u)
                resolve(true)
            } else {
                resolve(false)
            }
        })
    })
}

export const googleLogin = async () => {
    const auth = getAuth()
    const provider = new GoogleAuthProvider()
    return await signInWithPopup(auth, provider)
}

export const getWeeks = async () => {
    const db = getFirestore()
    const snapshot = await getDocs(collection(db, 'weeks'))
    return snapshot.docs.map(doc => doc.id)
}

export const logOut = async () => {
    const auth = getAuth()
    return await signOut(auth)
}

export const setUser = async (user: UserInfo) => {
    const db = getFirestore()
    setDoc(doc(db, 'players', user.uid), {
        name: user.displayName,
        photoURL: user.photoURL,
        email: user.email,
        id: user.uid
    })
}

export const getSubmissionLock = async (week) => {
    const db = getFirestore()
    const snapshot = await getDoc(doc(db, 'weeks', week))
    const submissionLock: Timestamp = snapshot.data().submissionLock
    return submissionLock.toMillis()
}

export const getPlayers = async () => {
    const db = getFirestore()
    const snapshot = await getDocs(collection(db, 'players'))
    return snapshot.docs.map(doc => doc.data())
}

export const getPicksForUser = async (uid, week) => {
    const db = getFirestore()
    const picks = {}
    const snapshot = await getDocs(collection(db, 'weeks', week, 'games'))
    const games = snapshot.docs.map(doc => doc.ref)

    const promises = []
    for (const game of games) {
        const pickDoc = doc(game, 'picks', uid)
        promises.push(getDoc(pickDoc).then((snapshot) => {
            if (snapshot.exists()) {
                picks[game.id] = snapshot.data()
            }
        }))
    }

    await Promise.all(promises)

    return picks
}

export const submitPicksForUser = async (uid, picks: PlayerPicks, week) => {
    const db = getFirestore()
    const gamesSnapshot = await getDocs(collection(db, 'weeks', week, 'games'))
    const games = gamesSnapshot.docs.map(doc => doc.ref)

    const promises = []
    for (const game of games) {
        promises.push(setDoc(doc(game, 'picks', uid), picks[game.id]))
    }

    await Promise.all(promises)
}

export const getGameIds = async (week) => {
    const db = getFirestore()
    const gamesSnapshot = await getDocs(collection(db, 'weeks', week, 'games'))
    return gamesSnapshot.docs.map(doc => doc.id)
}

export const getPicks = async (week) => {
    const picks: Picks = {}

    const db = getFirestore()
    const gamesSnapshot = await getDocs(collection(db, 'weeks', week, 'games'))
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
