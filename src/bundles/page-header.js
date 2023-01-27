import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown } from 'antd';
import HeaderLogo from './header-logo.js';
import { useTranslation } from 'react-i18next';
import { QuestionOutlined } from '@ant-design/icons';
import routes from '@educandu/educandu/utils/routes.js';
import Login from '@educandu/educandu/components/login.js';
import { useUser } from '@educandu/educandu/components/user-context.js';
import { useLocale } from '@educandu/educandu/components/locale-context.js';
import { useSettings } from '@educandu/educandu/components/settings-context.js';
import HomeIcon from '@educandu/educandu/components/icons/main-menu/home-icon.js';
import MenuIcon from '@educandu/educandu/components/icons/main-menu/menu-icon.js';
import LogoutIcon from '@educandu/educandu/components/icons/main-menu/logout-icon.js';
import permissions, { hasUserPermission } from '@educandu/educandu/domain/permissions.js';
import LanguageIcon from '@educandu/educandu/components/icons/main-menu/language-icon.js';
import SettingsIcon from '@educandu/educandu/components/icons/main-menu/settings-icon.js';
import DocumentsIcon from '@educandu/educandu/components/icons/main-menu/documents-icon.js';
import DashboardIcon from '@educandu/educandu/components/icons/main-menu/dashboard-icon.js';

function PageHeader({ onUiLanguageClick }) {
  const user = useUser();
  const settings = useSettings();
  const { uiLanguage } = useLocale();
  const { t } = useTranslation('page');
  const helpPage = settings?.helpPage?.[uiLanguage];

  const pageMenuItems = [
    {
      key: 'home',
      label: t('pageNames:home'),
      icon: <HomeIcon />,
      onClick: () => { window.location = routes.getHomeUrl(); },
      showWhen: true
    },
    {
      key: 'dashboard',
      label: t('pageNames:dashboard'),
      icon: <DashboardIcon />,
      onClick: () => { window.location = routes.getDashboardUrl(); },
      showWhen: !!user
    },
    {
      key: 'docs',
      label: t('pageNames:docs'),
      icon: <DocumentsIcon />,
      onClick: () => { window.location = routes.getDocsUrl(); },
      showWhen: hasUserPermission(user, permissions.VIEW_DOCS)
    },
    {
      key: 'admin',
      label: t('pageNames:admin'),
      icon: <SettingsIcon />,
      onClick: () => { window.location = routes.getAdminUrl(); },
      showWhen: hasUserPermission(user, permissions.ADMIN)
    },
    {
      key: 'help',
      label: helpPage?.linkTitle,
      icon: <QuestionOutlined />,
      onClick: () => { window.location = helpPage ? routes.getDocUrl({ id: helpPage.documentId }) : ''; },
      showWhen: !!helpPage?.documentId
    },
    {
      key: 'ui-language',
      label: t('common:language'),
      icon: <LanguageIcon />,
      onClick: () => onUiLanguageClick(),
      showWhen: true
    },
    {
      key: 'logout',
      label: t('common:logout'),
      icon: <LogoutIcon />,
      onClick: () => { window.location = routes.getLogoutUrl(); },
      showWhen: !!user
    }
  ].filter(item => item.showWhen);

  const handleMenuItemClick = ({ key }) => {
    const clickedItem = pageMenuItems.find(item => item.key === key);
    clickedItem.onClick();
  };

  const menuItems = pageMenuItems.map(({ key, label, icon }) => ({ key, label, icon }));

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
          <Dropdown
            trigger={['click']}
            placement="bottomRight"
            arrow={{ pointAtCenter: true }}
            menu={{ items: menuItems, onClick: handleMenuItemClick }}
            >
            <Button className="PageHeader-headerButton" icon={<MenuIcon />} type="link" />
          </Dropdown>
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
