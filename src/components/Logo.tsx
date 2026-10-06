import styles from './Logo.module.css'

export function Logo({ stor = false }: { stor?: boolean }) {
  return (
    <span className={`${styles.logo} ${stor ? styles.stor : ''}`}>
      <span className={styles.anker}>Anker</span>
      <span className={styles.solutions}>Solutions</span>
    </span>
  )
}
