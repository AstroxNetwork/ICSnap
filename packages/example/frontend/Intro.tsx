import React, { createFactory, useCallback, useEffect, useState } from "react"
import logo from "./assets/logo-dark.svg"
import { initiateICPSnap } from "./services/metamask"
import { SnapIdentity } from "@astrox/icsnap-adapter"
import { SignRawMessageResponse } from "@astrox/icsnap-types"
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

  const installSnap = useCallback(async () => {
    const installResult = await initiateICPSnap()
    if (!installResult.isSnapInstalled) {
      setInstalled(false)
    } else {
      setInstalled(true)
      setSnapIdentity(await installResult.snap?.createSnapIdentity())
    }
  }, [])

  const getPrincipal = async () => {
    setPrincipal(snapIdentity?.getPrincipal()!.toText())
  }

  const signMessage = async () => {
    const signed = await snapIdentity?.signRawMessage(message!)
    console.log({ signed })
    setSignedMessage(signed!)
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
