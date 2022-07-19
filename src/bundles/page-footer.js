import React from 'react';
import routes from '@educandu/educandu/utils/routes.js';
import { useLocale } from '@educandu/educandu/components/locale-context.js';
import { useSettings } from '@educandu/educandu/components/settings-context.js';

function PageFooter() {
  const settings = useSettings();
  const { uiLanguage } = useLocale();

  return (
    <footer className="PageFooter">
      <div>
        {(settings?.footerLinks?.[uiLanguage] || []).map((fl, index) => (
          <span key={index.toString()} className="PageFooter-link">
            <a href={routes.getDocUrl({ id: fl.documentId })}>{fl.linkTitle}</a>
          </span>
        ))}
      </div>
    </footer>
  );
}

export default PageFooter;
