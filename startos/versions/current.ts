import { VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.3.0:1',
  releaseNotes: {
    en_US:
      'Add optional mainnet Bark and Arkade explorers. Choose Disabled, Public server or Custom URL independently for each provider. Both are disabled by default.',
    es_ES:
      'Añade exploradores opcionales de Bark y Arkade en mainnet. Elige Desactivado, Servidor público o URL personalizada para cada proveedor. Ambos están desactivados por defecto.',
    de_DE:
      'Optionale Bark- und Arkade-Explorer für Mainnet. Für jeden Anbieter separat Deaktiviert, Öffentlicher Server oder Eigene URL wählen. Beide sind standardmäßig deaktiviert.',
    pl_PL:
      'Opcjonalne eksploratory Bark i Arkade w mainnet. Wybierz osobno dla każdego dostawcy: Wyłączone, Serwer publiczny lub Własny URL. Oba są domyślnie wyłączone.',
    fr_FR:
      'Ajoute les explorateurs Bark et Arkade optionnels sur mainnet. Choisissez Désactivé, Serveur public ou URL personnalisée pour chaque fournisseur. Les deux sont désactivés par défaut.',
  },
  migrations: {},
})
