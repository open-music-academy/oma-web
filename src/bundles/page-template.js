import Logo from './logo.js';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Alert, Button } from 'antd';
import { useTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import urls from '@educandu/educandu/utils/urls.js';
import permissions from '@educandu/educandu/domain/permissions.js';
import Restricted from '@educandu/educandu/components/restricted.js';
import LoginLogout from '@educandu/educandu/components/login-logout.js';
import LinkPopover from '@educandu/educandu/components/link-popover.js';
import ClientConfig from '@educandu/educandu/bootstrap/client-config.js';
import { FEATURE_TOGGLES } from '@educandu/educandu/common/constants.js';
import { useService } from '@educandu/educandu/components/container-context.js';
import { useLanguage } from '@educandu/educandu/components/language-context.js';
import { useSettings } from '@educandu/educandu/components/settings-context.js';
import LanguageNameProvider from '@educandu/educandu/data/language-name-provider.js';
import CountryFlagAndName from '@educandu/educandu/components/localization/country-flag-and-name.js';
import { default as iconsNs, QuestionOutlined, MenuOutlined, HomeOutlined, FileOutlined, UserOutlined, SettingOutlined, ImportOutlined } from '@ant-design/icons';

const Icon = iconsNs.default || iconsNs;

function createLanguagesToChoose(languageNameProvider, supportedLanguages, language) {
  const data = languageNameProvider.getData(language);
  return supportedLanguages.map(lang => ({ ...data[lang], code: lang }));
}

function PageTemplate({ children, fullScreen, headerActions, alerts }) {
  const settings = useSettings();
  const clientConfig = useService(ClientConfig);
  const { t, i18n } = useTranslation('page');
  const { supportedLanguages, language } = useLanguage();
  const languageNameProvider = useService(LanguageNameProvider);
  const [languagesToChoose, setLanguagesToChoose] = useState(createLanguagesToChoose(languageNameProvider, supportedLanguages, language));

  useEffect(() => {
    setLanguagesToChoose(createLanguagesToChoose(languageNameProvider, supportedLanguages, language));
  }, [languageNameProvider, supportedLanguages, language]);

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
      permission: null
    },
    {
      key: 'docs',
      href: urls.getDocsUrl(),
      text: t('pageNames:docs'),
      icon: FileOutlined,
      permission: permissions.VIEW_DOCS
    },
    {
      key: 'users',
      href: urls.getUsersUrl(),
      text: t('pageNames:users'),
      icon: UserOutlined,
      permission: permissions.EDIT_USERS
    },
    {
      key: 'settings',
      href: urls.getSettingsUrl(),
      text: t('pageNames:settings'),
      icon: SettingOutlined,
      permission: permissions.EDIT_SETTINGS
    }
  ];

  if (!clientConfig.disabledFeatures.includes(FEATURE_TOGGLES.import)) {
    pageMenuItems.push({
      key: 'import',
      href: urls.getImportsUrl(),
      text: t('pageNames:importBatches'),
      icon: ImportOutlined,
      permission: permissions.MANAGE_IMPORT
    });
  }

  if (settings?.helpPage?.[language]) {
    pageMenuItems.push({
      key: 'help',
      href: urls.getArticleUrl(settings.helpPage[language].documentSlug),
      text: settings.helpPage[language].linkTitle,
      icon: QuestionOutlined,
      permission: permissions.EDIT_SETTINGS
    });
  }

  pageMenuItems.push({
    key: 'language',
    node: (
      <div className="PageTemplate-languageSwitch">
        {languagesToChoose.map((lang, index) => (
          <React.Fragment key={lang.code}>
            {index !== 0 && <span>/</span>}
            <Button type="link" size="small" onClick={() => i18n.changeLanguage(lang.code)}>
              <CountryFlagAndName code={lang.flag} name={lang.name} flagOnly />
            </Button>
          </React.Fragment>
        ))}
      </div>),
    permission: null
  });

  return (
    <div className="PageTemplate">
      <header className={pageHeaderAreaClasses}>
        <div className="PageTemplate-header">
          <div className="PageTemplate-headerContent PageTemplate-headerContent--left">
            {!fullScreen && <Logo />}
          </div>
          <div className="PageTemplate-headerContent PageTemplate-headerContent--center">
            {headerActionComponents}
          </div>
          <div className="PageTemplate-headerContent PageTemplate-headerContent--right">
            <div className="PageTemplate-loginLogoutButton">
              <LoginLogout />
            </div>
            <LinkPopover items={pageMenuItems} trigger="hover" placement="bottomRight">
              <Button className="PageTemplate-headerButton" icon={<MenuOutlined />} />
            </LinkPopover>
          </div>
        </div>
        {!fullScreen && alerts && alerts.map((alert, index) => (
          <Alert key={index.toString()} message={alert.message} type={alert.type || 'info'} banner />
        ))}
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
              <a href={urls.getArticleUrl(fl.documentSlug)}>{fl.linkTitle}</a>
            </span>
          ))}
        </div>
      </footer>
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
