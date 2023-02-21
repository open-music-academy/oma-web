import md5 from 'md5';
import { Alert } from 'antd';
import HeaderLogo from './header-logo.js';
import React, { useEffect, useMemo, useState } from 'react';
import Markdown from '@educandu/educandu/components/markdown.js';
import ClientConfig from '@educandu/educandu/bootstrap/client-config.js';
import { useSettings } from '@educandu/educandu/components/settings-context.js';
import { useService } from '@educandu/educandu/components/container-context.js';
import NavigationMobile from '@educandu/educandu/components/navigation-mobile.js';
import NavigationDesktop from '@educandu/educandu/components/navigation-desktop.js';
import { getCookie, setLongLastingCookie } from '@educandu/educandu/common/cookie.js';

const generateCookieHash = textInAllLanguages => {
  return textInAllLanguages ? md5(JSON.stringify(textInAllLanguages)) : '';
};

function PageHeader() {
  const settings = useSettings();
  const { announcementCookieNamePrefix } = useService(ClientConfig);

  const [showAnnouncement, setShowAnnouncement] = useState(false);

  const announcementCookieName = `${announcementCookieNamePrefix}_${useMemo(() => generateCookieHash(JSON.stringify(settings.announcement)), [settings.announcement])}`;

  useEffect(() => {
    const announcementCookie = getCookie(announcementCookieName);
    if (!announcementCookie && settings.announcement?.text) {
      setShowAnnouncement(true);
    }
  }, [announcementCookieName, settings.announcement]);

  const handleAnnouncementClose = () => {
    setLongLastingCookie(announcementCookieName, 'true');
    setShowAnnouncement(false);
  };

  return (
    <header className="PageHeader">
      <div className="PageHeader-content">
        <HeaderLogo />
        <div className="PageHeader-navigation PageHeader-navigation--desktop">
          <NavigationDesktop />
        </div>
        <div className="PageHeader-navigation PageHeader-navigation--mobile">
          <NavigationMobile />
        </div>
      </div>
      {!!showAnnouncement && (
        <Alert
          closable
          banner
          type={settings.announcement.type}
          message={<Markdown>{settings.announcement.text}</Markdown>}
          className="PageHeader-announcement"
          onClose={handleAnnouncementClose}
          />
      )}
    </header>
  );
}

export default PageHeader;
