import * as path from 'path'
import * as fs from 'fs/promises'

export const cleanupOutdatedReports = async (ghPagesBaseDir: string, maxReports: number) => {
    try {
        const localBranches = (await fs.readdir(ghPagesBaseDir, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name)

        // branches
        for (const localBranch of localBranches) {
            const runs = (await fs.readdir(path.join(ghPagesBaseDir, localBranch), { withFileTypes: true }))
                .filter((d) => d.isDirectory())
                .map((d) => d.name)

            if (runs.length > maxReports) {
                runs.sort((a, b) => {
                    const timestampA = parseInt(a.split('_')[1]);
                    const timestampB = parseInt(b.split('_')[1]);
                    return timestampA - timestampB;
                });
                while (runs.length > maxReports) {
                    await fs.rm(path.join(ghPagesBaseDir, localBranch, runs.shift() as string), {
                        recursive: true,
                        force: true,
                    })
                }
            }
        }
    } catch (err) {
        console.error('cleanup outdated reports failed.', err)
    }
}
