import React from 'react';
import { Button } from 'antd';
import PropTypes from 'prop-types';
import HeaderLogo from './header-logo.js';
import { useTranslation } from 'react-i18next';
import { QuestionOutlined } from '@ant-design/icons';
import routes from '@educandu/educandu/utils/routes.js';
import Login from '@educandu/educandu/components/login.js';
import permissions from '@educandu/educandu/domain/permissions.js';
import { useUser } from '@educandu/educandu/components/user-context.js';
import LinkPopover from '@educandu/educandu/components/link-popover.js';
import ClientConfig from '@educandu/educandu/bootstrap/client-config.js';
import { FEATURE_TOGGLES } from '@educandu/educandu/domain/constants.js';
import { useLocale } from '@educandu/educandu/components/locale-context.js';
import { useService } from '@educandu/educandu/components/container-context.js';
import { useSettings } from '@educandu/educandu/components/settings-context.js';
import HomeIcon from '@educandu/educandu/components/icons/main-menu/home-icon.js';
import MenuIcon from '@educandu/educandu/components/icons/main-menu/menu-icon.js';
import UsersIcon from '@educandu/educandu/components/icons/main-menu/users-icon.js';
import LogoutIcon from '@educandu/educandu/components/icons/main-menu/logout-icon.js';
import ImportsIcon from '@educandu/educandu/components/icons/main-menu/imports-icon.js';
import LanguageIcon from '@educandu/educandu/components/icons/main-menu/language-icon.js';
import SettingsIcon from '@educandu/educandu/components/icons/main-menu/settings-icon.js';
import DocumentsIcon from '@educandu/educandu/components/icons/main-menu/documents-icon.js';
import DashboardIcon from '@educandu/educandu/components/icons/main-menu/dashboard-icon.js';

function PageHeader({ onUiLanguageClick }) {
  const user = useUser();
  const settings = useSettings();
  const { uiLanguage } = useLocale();
  const { t } = useTranslation('page');
  const clientConfig = useService(ClientConfig);
  const helpPage = settings?.helpPage?.[uiLanguage];

  const pageMenuItems = [
    {
      key: 'home',
      href: routes.getHomeUrl(),
      text: t('pageNames:home'),
      icon: HomeIcon,
      permission: null,
      showWhen: true
    },
    {
      key: 'dashboard',
      href: routes.getDashboardUrl(),
      text: t('pageNames:dashboard'),
      icon: DashboardIcon,
      permission: null,
      showWhen: !!user
    },
    {
      key: 'docs',
      href: routes.getDocsUrl(),
      text: t('pageNames:docs'),
      icon: DocumentsIcon,
      permission: permissions.VIEW_DOCS,
      showWhen: true
    },
    {
      key: 'users',
      href: routes.getUsersUrl(),
      text: t('pageNames:users'),
      icon: UsersIcon,
      permission: permissions.EDIT_USERS,
      showWhen: true
    },
    {
      key: 'admin',
      href: routes.getAdminUrl(),
      text: t('pageNames:admin'),
      icon: SettingsIcon,
      permission: permissions.ADMIN,
      showWhen: true
    },
    {
      key: 'import',
      href: routes.getImportsUrl(),
      text: t('pageNames:imports'),
      icon: ImportsIcon,
      permission: permissions.MANAGE_IMPORT,
      showWhen: !clientConfig.disabledFeatures.includes(FEATURE_TOGGLES.import)
    },
    {
      key: 'help',
      href: helpPage ? routes.getDocUrl({ key: helpPage.documentKey }) : '',
      text: helpPage?.linkTitle,
      icon: QuestionOutlined,
      permission: null,
      showWhen: !!helpPage
    },
    {
      key: 'ui-language',
      onClick: () => onUiLanguageClick(),
      text: t('common:language'),
      icon: LanguageIcon,
      permission: null,
      showWhen: true
    },
    {
      key: 'logout',
      href: routes.getLogoutUrl(),
      text: t('common:logout'),
      icon: LogoutIcon,
      permission: null,
      showWhen: !!user
    }
  ].filter(item => item.showWhen);

  return (
    <header className="PageHeader">
      <div className="PageHeader-header">
        <div className="PageHeader-headerContent PageHeader-headerContent--left">
          <HeaderLogo />
        </div>
        <div className="PageHeader-headerContent PageHeader-headerContent--right">
          <div className="PageHeader-loginButton">
            <Login />
          </div>
          <LinkPopover items={pageMenuItems} trigger="click" placement="bottomRight">
            <Button className="PageHeader-headerButton" icon={<MenuIcon />} type="link" />
          </LinkPopover>
        </div>
      </div>
    </header>
  );
}

PageHeader.propTypes = {
  onUiLanguageClick: PropTypes.func
};

PageHeader.defaultProps = {
  onUiLanguageClick: () => { }
};

export default PageHeader;
