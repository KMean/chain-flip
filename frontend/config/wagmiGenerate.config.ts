import { defineConfig } from '@wagmi/cli';
import { foundry } from '@wagmi/cli/plugins';

// Adjust the path to match your project structure
export default defineConfig({
    out: 'config/chainflip.ts',  // Output file where your contract hooks will be generated
    plugins: [
        foundry({
            project: '../backend',  // Path to your Foundry project
            exclude: [
                // the following patterns are excluded by default
                'Common.sol/**',
                'Components.sol/**',
                'Script.sol/**',
                'StdAssertions.sol/**',
                'StdInvariant.sol/**',
                'StdError.sol/**',
                'StdCheats.sol/**',
                'StdMath.sol/**',
                'StdJson.sol/**',
                'StdStorage.sol/**',
                'StdUtils.sol/**',
                'Vm.sol/**',
                'console.sol/**',
                'console2.sol/**',
                'test.sol/**',
                '**.s.sol/*.json',
                '**.t.sol/*.json',
                'DevOpsTools.sol/**',
            ],
        }),
    ],
});
