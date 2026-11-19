import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

export const current = VersionInfo.of({
  version: '0.4.0:0',
  releaseNotes: {
    en_US:
      'Update to rbitcoin.space 0.4.0 with redesigned mining, Lightning and mempool history pages, plus more detail on replaced transactions. Back up the explorer before updating. The database migration is one-way.',
    es_ES:
      'Actualiza a rbitcoin.space 0.4.0 con páginas renovadas de minería, Lightning e historial de la mempool, y más detalles sobre las transacciones reemplazadas. Haz una copia de seguridad del explorador antes de actualizar. La migración de la base de datos es irreversible.',
    de_DE:
      'Aktualisiert auf rbitcoin.space 0.4.0 mit neu gestalteten Seiten für Mining, Lightning und den Mempool-Verlauf sowie mehr Details zu ersetzten Transaktionen. Sichere den Explorer vor dem Update. Die Datenbankmigration ist unumkehrbar.',
    pl_PL:
      'Aktualizacja do rbitcoin.space 0.4.0 obejmuje nowe widoki wydobycia, Lightning i historii mempoola oraz więcej szczegółów o zastąpionych transakcjach. Przed aktualizacją utwórz kopię zapasową eksploratora. Migracja bazy danych jest nieodwracalna.',
    fr_FR:
      'Met à jour vers rbitcoin.space 0.4.0 avec de nouvelles pages pour le minage, Lightning et l’historique du mempool, ainsi que plus de détails sur les transactions remplacées. Sauvegardez l’explorateur avant la mise à jour. La migration de la base de données est irréversible.',
  },
  migrations: { down: IMPOSSIBLE },
})
