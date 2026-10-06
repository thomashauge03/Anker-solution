import styles from './Demobaand.module.css'

/** Vises når TESTMODUS er på, så ingen tror at en demo tar imot ekte bestillinger. */
export function Demobaand() {
  return (
    <div className={styles.baand} role="note">
      <p className="ramme">
        <strong>Demo.</strong> Siden er under arbeid. Bestillinger og forespørsler sendes ikke, og ingen penger
        trekkes.
      </p>
    </div>
  )
}
