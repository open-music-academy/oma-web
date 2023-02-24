import customResolvers from './custom-resolvers.js';
import { hydrateApp } from '@educandu/educandu/bootstrap/client-bootstrapper.js';

hydrateApp({ customResolvers });
