import { defineConfig } from '@adonisjs/inertia';
const inertiaConfig = defineConfig({
    ssr: {
        enabled: false,
        entrypoint: 'inertia/ssr.tsx',
    },
});
export default inertiaConfig;
//# sourceMappingURL=inertia.js.map