import { createInertiaApp } from '@inertiajs/react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import type { ReactNode } from 'react';

createInertiaApp({
    title: (title) => `${title ? `${title} — ` : ''}Donation Club`,
    resolve: (name) => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: true });
        const key = `./pages/${name.replace(/^\.\/Pages?\//i, '').replace(/\.tsx$/, '')}.tsx`;
        const page = pages[key];

        if (!page) {
            throw new Error(`Page not found: ${name}`);
        }

        return page as { default: () => ReactNode };
    },
    setup({ el, App, props }) {
        if (el.dataset.serverRendered === 'true') {
            hydrateRoot(el, <App {...props} />);
            return;
        }

        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#4f46e5',
    },
});

