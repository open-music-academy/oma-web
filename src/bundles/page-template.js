import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Alert, Button } from 'antd';
import SiteLogo from './site-logo.js';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import urls from '@educandu/educandu/utils/urls.js';
import Login from '@educandu/educandu/components/login.js';
import permissions from '@educandu/educandu/domain/permissions.js';
import Restricted from '@educandu/educandu/components/restricted.js';
import { useUser } from '@educandu/educandu/components/user-context.js';
import LinkPopover from '@educandu/educandu/components/link-popover.js';
import ClientConfig from '@educandu/educandu/bootstrap/client-config.js';
import { FEATURE_TOGGLES } from '@educandu/educandu/domain/constants.js';
import { useService } from '@educandu/educandu/components/container-context.js';
import { useLanguage } from '@educandu/educandu/components/language-context.js';
import { useSettings } from '@educandu/educandu/components/settings-context.js';
import UiLanguageDialog from '@educandu/educandu/components/ui-language-dialog.js';
import CookieConsentDrawer from '@educandu/educandu/components/cookie-consent-drawer.js';
import { default as iconsNs, QuestionOutlined, MenuOutlined, LogoutOutlined, HomeOutlined, IdcardOutlined, FileOutlined, UserOutlined, SettingOutlined, ImportOutlined, GlobalOutlined } from '@ant-design/icons';

const Icon = iconsNs.default || iconsNs;

function PageTemplate({ children, fullScreen, headerActions, alerts }) {
  const user = useUser();
  const settings = useSettings();
  const { language } = useLanguage();
  const { t } = useTranslation('page');
  const clientConfig = useService(ClientConfig);
  const helpPage = settings?.helpPage?.[language];
  const [isUiLanguageDialogVisible, setIsUiLanguageDialogVisible] = useState(false);

  const handleUiLanguageDialogClose = () => {
    setIsUiLanguageDialogVisible(false);
  };

  const pageHeaderAreaClasses = classNames({
    'PageTemplate-headerArea': true,
    'PageTemplate-headerArea--fullScreen': fullScreen
  });
  const pageContentAreaClasses = classNames({
    'PageTemplate-contentArea': true,
    'PageTemplate-contentArea--fullScreen': fullScreen
  });
  const pageContentClasses = classNames({
    'PageTemplate-content': true,
    'PageTemplate-content--fullScreen': fullScreen
  });

  let headerActionComponents = null;
  if (headerActions && headerActions.length) {
    headerActionComponents = headerActions.map(action => (
      <Restricted to={action.permission} key={action.key}>
        <Button
          className="PageTemplate-headerButton"
          type={action.type || 'default'}
          loading={!!action.loading}
          disabled={!!action.disabled}
          icon={<Icon component={action.icon} />}
          onClick={action.handleClick}
          ghost
          >
          {action.text}
        </Button>
      </Restricted>
    ));
  }

  const pageMenuItems = [
    {
      key: 'home',
      href: urls.getHomeUrl(),
      text: t('pageNames:home'),
      icon: HomeOutlined,
      permission: null,
      showWhen: true
    },
    {
      key: 'my-space',
      href: urls.getMySpaceUrl(),
      text: t('pageNames:mySpace'),
      icon: IdcardOutlined,
      permission: null,
      showWhen: !!user
    },
    {
      key: 'docs',
      href: urls.getDocsUrl(),
      text: t('pageNames:docs'),
      icon: FileOutlined,
      permission: permissions.VIEW_DOCS,
      showWhen: true
    },
    {
      key: 'users',
      href: urls.getUsersUrl(),
      text: t('pageNames:users'),
      icon: UserOutlined,
      permission: permissions.EDIT_USERS,
      showWhen: true
    },
    {
      key: 'settings',
      href: urls.getSettingsUrl(),
      text: t('pageNames:settings'),
      icon: SettingOutlined,
      permission: permissions.EDIT_SETTINGS,
      showWhen: true
    },
    {
      key: 'import',
      href: urls.getImportsUrl(),
      text: t('pageNames:importBatches'),
      icon: ImportOutlined,
      permission: permissions.MANAGE_IMPORT,
      showWhen: !clientConfig.disabledFeatures.includes(FEATURE_TOGGLES.import)
    },
    {
      key: 'help',
      href: helpPage ? urls.getDocUrl(helpPage.documentKey, helpPage.documentSlug) : '',
      text: helpPage?.linkTitle,
      icon: QuestionOutlined,
      permission: null,
      showWhen: !!helpPage
    },
    {
      key: 'language',
      onClick: () => setIsUiLanguageDialogVisible(true),
      text: t('common:language'),
      icon: GlobalOutlined,
      permission: null,
      showWhen: true
    },
    {
      key: 'logout',
      href: urls.getLogoutUrl(),
      text: t('common:logoff'),
      icon: LogoutOutlined,
      permission: null,
      showWhen: !!user
    }
  ].filter(item => item.showWhen);

  const renderAlert = (alert, index) => {
    const shouldRenderAlert = !fullScreen || alert.showInFullScreen;
    if (!shouldRenderAlert) {
      return null;
    }

    return (
      <Alert
        key={index}
        message={alert.message}
        type={alert.type || 'info'}
        banner
        closable={alert.closable || false}
        onClose={alert.onClose || (() => { })}
        />
    );
  };

  return (
    <div className="PageTemplate">
      <header className={pageHeaderAreaClasses}>
        <div className="PageTemplate-header">
          <div className="PageTemplate-headerContent PageTemplate-headerContent--left">
            <SiteLogo size="small" />
          </div>
          <div className="PageTemplate-headerContent PageTemplate-headerContent--center">
            {headerActionComponents}
          </div>
          <div className="PageTemplate-headerContent PageTemplate-headerContent--right">
            <div className="PageTemplate-loginButton">
              <Login />
            </div>
            <LinkPopover items={pageMenuItems} trigger="hover" placement="bottomRight">
              <Button className="PageTemplate-headerButton" icon={<MenuOutlined />} ghost />
            </LinkPopover>
          </div>
        </div>
        {alerts && alerts.map(renderAlert)}
      </header>
      <main className={pageContentAreaClasses}>
        <div className={pageContentClasses}>
          {children}
        </div>
      </main>
      <footer className="PageTemplate-footer">
        <div className="PageTemplate-footerContent">
          {(settings?.footerLinks?.[language] || []).map((fl, index) => (
            <span key={index.toString()} className="PageTemplate-footerLink">
              <a href={urls.getDocUrl(fl.documentKey, fl.documentSlug)}>{fl.linkTitle}</a>
            </span>
          ))}
        </div>
      </footer>
      <UiLanguageDialog visible={isUiLanguageDialogVisible} onClose={handleUiLanguageDialogClose} />
      <CookieConsentDrawer />
    </div>
  );
}

PageTemplate.propTypes = {
  alerts: PropTypes.arrayOf(PropTypes.shape({
    message: PropTypes.node.isRequired,
    type: PropTypes.oneOf(['success', 'info', 'warning', 'error'])
  })),
  children: PropTypes.node,
  fullScreen: PropTypes.bool,
  headerActions: PropTypes.arrayOf(PropTypes.shape({
    handleClick: PropTypes.func.isRequired,
    icon: PropTypes.elementType.isRequired,
    key: PropTypes.string.isRequired,
    permission: PropTypes.string,
    text: PropTypes.string.isRequired,
    type: PropTypes.string,
    loading: PropTypes.bool
  }))
};

PageTemplate.defaultProps = {
  alerts: [],
  children: null,
  fullScreen: false,
  headerActions: []
};

export default PageTemplate;
