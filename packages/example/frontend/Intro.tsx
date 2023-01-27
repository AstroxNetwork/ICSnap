import React, { createFactory, useCallback, useEffect, useState } from "react"
import logo from "./assets/logo-dark.svg"
import { initiateICPSnap, requestDelegation } from "./services/metamask"
import { SnapIdentity } from "@astrox/icsnap-adapter"
import { SignRawMessageResponse } from "@astrox/icsnap-types"
import {
  Actor,
  ActorSubclass,
  AnonymousIdentity,
  SignIdentity,
} from "@dfinity/agent"
import { counter, createActor } from "./services"
import { _SERVICE as counterService } from "./services/counter.did"
import { DelegationIdentity, Ed25519KeyIdentity } from "@dfinity/identity"
// import { canisterId, createActor } from "./services"

export function Intro() {
  const [principal, setPrincipal] = useState<string | undefined>(undefined)

  const [installed, setInstalled] = useState<boolean>(false)
  const [message, setMessage] = useState<string | undefined>(undefined)
  const [signedMessage, setSignedMessage] = useState<
    SignRawMessageResponse | undefined
  >(undefined)

  const [snapIdentity, setSnapIdentity] = useState<SnapIdentity | undefined>(
    undefined,
  )
  const [counterActor, setCounterActor] = useState<
    ActorSubclass<counterService> | undefined
  >(undefined)

  const [counterVal, setCounterVal] = useState<bigint>(BigInt(0))
  const [loading, setLoading] = useState<boolean>(false)

  const [delegationIdentity, setDelegationIdentity] = useState<
    DelegationIdentity | undefined
  >(undefined)

  const [sessionKey, setSessionKey] = useState<SignIdentity | undefined>()

  const installSnap = useCallback(async () => {
    const installResult = await initiateICPSnap()
    if (!installResult.isSnapInstalled) {
      setInstalled(false)
    } else {
      setInstalled(true)
      setSnapIdentity(await installResult.snap?.createSnapIdentity())
      setCounter(await installResult.snap?.createSnapIdentity())
    }
  }, [])

  const getPrincipal = async () => {
    setPrincipal(snapIdentity?.getPrincipal()!.toText())
    await getCounterVal()
  }

  const signMessage = async () => {
    const signed = await snapIdentity?.signRawMessage(message!)
    console.log({ signed })
    setSignedMessage(signed!)
  }

  const setCounter = (identity: SnapIdentity | undefined) => {
    const result = createActor(process.env.COUNTER_CANISTER_ID!, {
      agentOptions: { identity: identity ?? new AnonymousIdentity() },
    })
    setCounterActor(result)
  }

  const increase = async () => {
    setLoading(true)
    await counter.increment()
    setLoading(false)
  }

  const getCounterVal = async () => {
    const v = await counter.getValue()
    setCounterVal(v)
  }

  const createDelegationIdentity = async () => {
    const sk = Ed25519KeyIdentity.generate()
    const delgation = await requestDelegation(snapIdentity!, { sessionKey: sk })
    setSessionKey(sk)
    setDelegationIdentity(delgation)
  }

  useEffect(() => {
    if (!snapIdentity) {
      installSnap()
    } else {
      getPrincipal()
    }
  }, [snapIdentity])
  return (
    <>
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p style={{ fontSize: "2em", marginBottom: "0.5em" }}>
          Ready. Lets use Snap
        </p>
        <div
          style={{
            display: "flex",
            fontSize: "0.7em",
            textAlign: "left",
            padding: "2em",
            borderRadius: "30px",
            flexDirection: "column",
            background: "rgb(220 218 224 / 25%)",
            flex: 1,
            width: "32em",
          }}
        >
          {installed ? (
            <div style={{ width: "100%", minWidth: "100%" }}>
              <code>Principal is:</code>
              <p>{principal ?? "...loading"}</p>
            </div>
          ) : (
            <button className="demo-button" onClick={installSnap}>
              Install Snap
            </button>
          )}
          {installed ? (
            <>
              <label style={{ marginBottom: 16 }}>Input Messsage To Sign</label>
              <input
                aria-label="To Sign a message"
                style={{ padding: "1em" }}
                onChange={(e) => {
                  setMessage(e.target.value)
                }}
              />
              <button className="demo-button" onClick={signMessage}>
                Sign Message
              </button>
            </>
          ) : null}
          {signedMessage?.signature !== undefined ? (
            <div
              style={{
                wordBreak: "break-all",
                maxWidth: "100%",
                margin: "1em 0",
              }}
            >
              <code>Signature is : </code>
              <p>{signedMessage?.signature}</p>
            </div>
          ) : null}
        </div>

        <p style={{ fontSize: "0.6em" }}>ICSnap is running inside metamask</p>
      </header>
      <div className="App-body">
        <div
          style={{
            display: "flex",
            fontSize: "0.7em",
            textAlign: "left",
            padding: "2em",
            borderRadius: "30px",
            flexDirection: "column",
            background: "rgb(220 218 224 / 25%)",
            flex: 1,
            width: "32em",
            marginBottom: "2em",
          }}
        >
          {!counterActor ? (
            <>Wait for counter canister is initialised</>
          ) : (
            <>
              <p>
                {loading
                  ? "Fetching latest counter value..."
                  : counterVal.toString()}
              </p>
              <button
                className="demo-button"
                onClick={async () => {
                  await increase()
                  await getCounterVal()
                }}
              >
                Increase Counter
              </button>
            </>
          )}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "0.7em",
            textAlign: "left",
            padding: "2em",
            borderRadius: "30px",
            flexDirection: "column",
            background: "rgb(220 218 224 / 25%)",
            flex: 1,
            width: "32em",
          }}
        >
          <p>Create delegation Identity</p>
          <div
            style={{
              wordBreak: "break-all",
              maxWidth: "100%",
              margin: "1em 0",
            }}
          >
            <code>Session Key is : </code>
            <p>
              {sessionKey
                ? sessionKey?.getPrincipal().toText()
                : "press button to create"}
            </p>
          </div>
          <div
            style={{
              wordBreak: "break-all",
              maxWidth: "100%",
              margin: "1em 0",
            }}
          >
            <code>Signed Delegation Chain is : </code>
            <p>
              {delegationIdentity
                ? JSON.stringify(delegationIdentity?.getDelegation().toJSON())
                : "press button to create"}
            </p>
          </div>
          <button
            className="demo-button"
            onClick={async () => {
              await createDelegationIdentity()
            }}
          >
            Create Delegation
          </button>
        </div>
      </div>

      <footer>
        <div
          style={{ textAlign: "center", fontSize: "0.8em", marginTop: "2em" }}
        >
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
          {" | "}
          <a
            className="App-link"
            href="https://sdk.dfinity.org/docs/developers-guide/sdk-guide.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            IC SDK Docs
          </a>
        </div>
      </footer>
    </>
  )
}
