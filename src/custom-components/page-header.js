import md5 from 'md5';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import HeaderLogo from './header-logo.js';
import useDimensionsNs from 'react-cool-dimensions';
import React, { useEffect, useMemo, useState } from 'react';
import Markdown from '@educandu/educandu/components/markdown.js';
import { useScrollTopOffset } from '@educandu/educandu/ui/hooks.js';
import CustomAlert from '@educandu/educandu/components/custom-alert.js';
import ClientConfig from '@educandu/educandu/bootstrap/client-config.js';
import { useSettings } from '@educandu/educandu/components/settings-context.js';
import { useService } from '@educandu/educandu/components/container-context.js';
import NavigationMobile from '@educandu/educandu/components/navigation-mobile.js';
import NavigationDesktop from '@educandu/educandu/components/navigation-desktop.js';
import { getCookie, setLongLastingCookie } from '@educandu/educandu/common/cookie.js';

const useDimensions = useDimensionsNs.default || useDimensionsNs;

const generateCookieHash = textInAllLanguages => {
  return textInAllLanguages ? md5(JSON.stringify(textInAllLanguages)) : '';
};

function PageHeader({ focusContent }) {
  const settings = useSettings();
  const topOffset = useScrollTopOffset();
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const { announcementCookieNamePrefix } = useService(ClientConfig);
  const { observe, height } = useDimensions({ useBorderBoxSize: true });

  const isSticky = !!topOffset || !!focusContent;
  const cookieHash = useMemo(() => generateCookieHash(JSON.stringify(settings.announcement)), [settings.announcement]);
  const announcementCookieName = `${announcementCookieNamePrefix}_${cookieHash}`;

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
    <header className="PageHeader" style={{ paddingBottom: `${isSticky ? height : 0}px` }}>
      <div ref={observe} className={classNames('PageHeader-container', { 'is-sticky': isSticky })}>
        {!!focusContent && (
          <div>{focusContent}</div>
        )}
        {!focusContent && (
          <div className="PageHeader-content">
            <div className="PageHeader-logo">
              <HeaderLogo />
            </div>
            <div className="PageHeader-navigation PageHeader-navigation--desktop">
              <NavigationDesktop />
            </div>
            <div className="PageHeader-navigation PageHeader-navigation--mobile">
              <NavigationMobile />
            </div>
          </div>
        )}
        {!focusContent && !!showAnnouncement && (
          <CustomAlert
            closable
            banner
            type={settings.announcement.type}
            message={<Markdown>{settings.announcement.text}</Markdown>}
            className="PageHeader-announcement"
            onClose={handleAnnouncementClose}
            />
        )}
      </div>
    </header>
  );
}

PageHeader.propTypes = {
  focusContent: PropTypes.node
};

PageHeader.defaultProps = {
  focusContent: null
};

export default PageHeader;
