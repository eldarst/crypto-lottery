import { useState, useEffect } from 'react'
import Head from 'next/head'
import Image from 'next/image'
import Web3 from 'web3'
import lotteryContract from '../blockchain/lottery'
import { Inter } from '@next/font/google'
import styles from '../styles/Home.module.css'

import 'bulma/css/bulma.css'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {

  const [web3, setWeb3] = useState()
  const [address, setAddress] = useState()
  const [lcContract, setLcContract] = useState()
  const [enterenceFee, setEnterenceFee] = useState()
  const [lotteryPlayers, setPlayers] = useState([])
  const [numberOfPlayers, setNumberOfPlayers] = useState()
  const [lotteryState, setLotteryState] = useState()
  const [error, setError] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => {
    updateState()
  }, [lcContract])

  const updateState = () => {
    if (lcContract) getEnterenceFee()
    if (lcContract) getNumberOfPlayers()
    if (lcContract) getLotteryState()
  }

  const getEnterenceFee = async () => {
    console.log('getEnterenceFee')
    const fee = await lcContract.methods.getEnterenceFee().call()
    setEnterenceFee(web3.utils.fromWei(fee, 'ether'))
  }

  // const getPlayers = async () => {
  //   setPlayers([])
  //   await getNumberOfPlayers()
  //   for (let i = 0; i < parseInt(numberOfPlayers); i++) {
  //     const playerAddress = await lcContract.methods.getPlayer({index: i}).call()
  //     const playerObj = {}
  //     playerObj.id = i + 1
  //     playerObj.address = playerAddress
  //     setPlayers(lotteryPlayers => [...lotteryPlayers, playerObj])
  //   }
  // }

  const getNumberOfPlayers = async () => {
    const numPlayers = await lcContract.methods.getNuberOfPlayers().call()
    setNumberOfPlayers(numPlayers)
  }

  const getLotteryState = async () => {
    const lotteryState = await lcContract.methods.getLotteryState().call()
    setLotteryState(lotteryState)
  }

  const enterLotteryHandler = async () => {
    setError('')
    setSuccessMsg('')
    try {
      await lcContract.methods.enterLottery().send({
        from: address,
        value: '10000000000000005',
        gas: 2500000,
        gasPrice: null
      })
      updateState()
    } catch(err) {
      setError(err.message)
    }
  }

  const connectWalletHandler = async () => {
    setError('')
    setSuccessMsg('')
    if (typeof window !== "undefined" && typeof window.ethereum !== "undefined") {
      try {
        /* request wallet connection */
        await window.ethereum.request({ method: "eth_requestAccounts"})
        /* create web3 instance & set to state */
        const web3 = new Web3(window.ethereum)
        /* set web3 instance in React state */
        setWeb3(web3)
        /* get list of accounts */
        const accounts = await web3.eth.getAccounts()
        /* set account 1 to React state */
        setAddress(accounts[0])

        /* create local contract copy */
        const lc = lotteryContract(web3)
        setLcContract(lc)

        window.ethereum.on('accountsChanged', async () => {
          const accounts = await web3.eth.getAccounts()
          console.log(accounts[0])
          /* set account 1 to React state */
          setAddress(accounts[0])
        })
      } catch(err) {
        setError(err.message)
      }
    } else {
      console.log("Please install MetaMask")
    }
    
  }

  return (
    <>
      <Head>
        <title>Crypto Lottery</title>
        <meta name="description" content="Crypto Lottery" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <nav className="navbar mt-4 mb-4">
          <div className="container">
            <div className="navbar-brand">
              <h1>Crypto Lottery</h1>
            </div>
            <div className="navbar-end">
              <button onClick={connectWalletHandler} className="button is-success">Connect Wallet</button>
            </div>
          </div>
        </nav>
        <div className="container">
          <section className="mt-5">
            <div className="columns">
              <div className="column is-two-thirds">
              <section className="mt-5">
                  <p>Enter the lottery</p>
                  <button onClick={enterLotteryHandler} className="button is-link is-large is-light mt-3">Play now</button>
                </section>
                <section>
                  <div className="container has-text-danger mt-6">
                    <p>{error}</p>
                  </div>
                </section>
                <section>
                  <div className="container has-text-success mt-6">
                    <p>{successMsg}</p>
                  </div>
                </section>
              </div>
              <div className={`${styles.lotteryinfo} column is-one-third`}>
                <section className="mt-5">
                  <div className="card">
                    <div className="card-content">
                      <div className="content">
                        <h2>Lettery Info</h2>
                        <p>Enterence Fee is: {enterenceFee} Ether</p>
                        <p>Lottery State is: {lotteryState === '0' ? 'OPEN' : 'CLOSED'}</p>
                        <p>Number of Players: {numberOfPlayers}</p>
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </section>
        </div>

      </main>

      <footer className={styles.footer}>
        <p>&copy; 2022 Block Explorer</p>
      </footer>
    </>
  )
}
