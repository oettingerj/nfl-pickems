import { initializeApp } from 'firebase/app'
import { getFirestore, collection, getDocs, getDoc, doc, setDoc } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'firebase/auth'
import type { UserInfo } from 'firebase/auth'
import type { Timestamp } from 'firebase/firestore'
import { has } from 'lodash-es'
import { browser } from '$app/env'
import { goto } from '$app/navigation'
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

const verifyLoginStatus = () => {
    const auth = getAuth()
    onAuthStateChanged(auth, (u) => {
        if (u) {
            user.set(u)
        } else {
            goto('/login')
        }
    })
}

if (browser) {
    verifyLoginStatus()
}

export const googleLogin = async () => {
    const auth = getAuth()
    const provider = new GoogleAuthProvider()
    return await signInWithPopup(auth, provider)
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

export const getSubmissionLock = async () => {
    const db = getFirestore()
    const snapshot = await getDocs(collection(db, 'weeks'))
    const submissionLock: Timestamp = snapshot.docs[snapshot.size - 1].get('submissionLock')
    return submissionLock.toMillis()
}

export const getPlayers = async () => {
    const db = getFirestore()
    const snapshot = await getDocs(collection(db, 'players'))
    return snapshot.docs.map(doc => doc.data())
}

export const getPicksForUser = async (uid) => {
    const db = getFirestore()
    const picks = {}
    const snapshot = await getDocs(collection(db, 'weeks'))
    const currentWeek = snapshot.docs[snapshot.size - 1].ref
    const gamesSnapshot = await getDocs(collection(currentWeek, 'games'))
    const games = gamesSnapshot.docs.map(doc => doc.ref)

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

export const submitPicksForUser = async (uid, picks: PlayerPicks) => {
    const db = getFirestore()
    const snapshot = await getDocs(collection(db, 'weeks'))
    const currentWeek = snapshot.docs[snapshot.size - 1].ref
    const gamesSnapshot = await getDocs(collection(currentWeek, 'games'))
    const games = gamesSnapshot.docs.map(doc => doc.ref)

    console.log(picks)

    const promises = []
    for (const game of games) {
        promises.push(setDoc(doc(game, 'picks', uid), picks[game.id]))
    }

    await Promise.all(promises)
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
