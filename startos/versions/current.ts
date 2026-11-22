import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.5.0:0',
  releaseNotes: {
    en_US:
      'Adds historical address views, transaction privacy checks, fee tracking, timestamp verification, and Lightning channel close records. Back up the explorer before updating: the database migration is one-way. [Full release notes](https://github.com/smolcars/rbitcoin-space/releases/tag/v0.5.0)',
    es_ES:
      'Añade vistas históricas de direcciones, comprobaciones de privacidad de transacciones, seguimiento de comisiones, verificación de marcas de tiempo y registros de cierre de canales Lightning. Haz una copia de seguridad del explorador antes de actualizar: la migración de la base de datos es irreversible. [Notas completas](https://github.com/smolcars/rbitcoin-space/releases/tag/v0.5.0)',
    de_DE:
      'Ergänzt historische Adressansichten, Datenschutzprüfungen für Transaktionen, Gebührenverlauf, Zeitstempelprüfung und Lightning-Kanalschließungen. Sichere den Explorer vor dem Update: Die Datenbankmigration ist unumkehrbar. [Vollständige Versionshinweise](https://github.com/smolcars/rbitcoin-space/releases/tag/v0.5.0)',
    pl_PL:
      'Dodaje historyczne widoki adresów, kontrole prywatności transakcji, historię opłat, weryfikację znaczników czasu i historię zamknięć kanałów Lightning. Przed aktualizacją utwórz kopię zapasową eksploratora: migracja bazy danych jest nieodwracalna. [Pełne informacje o wydaniu](https://github.com/smolcars/rbitcoin-space/releases/tag/v0.5.0)',
    fr_FR:
      'Ajoute des vues historiques des adresses, des contrôles de confidentialité des transactions, le suivi des frais, la vérification des horodatages et l’historique des fermetures de canaux Lightning. Sauvegardez l’explorateur avant la mise à jour : la migration de la base de données est irréversible. [Notes de version complètes](https://github.com/smolcars/rbitcoin-space/releases/tag/v0.5.0)',
  },
  migrations: { down: IMPOSSIBLE },
})
