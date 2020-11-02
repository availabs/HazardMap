import React from "react"

import { NavMenu, NavMenuItem, NavMenuSeparator, NavItem } from "components/avl-components/components"

// import { useTheme } from "components/avl-components/wrappers/with-theme"
import withAuth from "components/avl-components/wrappers/with-auth"

export default withAuth(({ title, shadowed = true, user, children }) => {
  // const theme = useTheme();
  return (
    <div className="h-full">
      {!user.authed ? <NavItem to="/auth/login" type='top'>Login</NavItem> :
      <NavMenu control={
            <div className={`px-6 text-sm font-normal tracking-widest inline-flex flex-col content-start h-full pt-2`}>
              <div>{user.email ? user.email : ''}</div>
              <div  className='text-xs font-medium -my-1 text-left'>{user.groups[0] ? user.groups[0] : ''}</div>
            </div>
        }>
        { user.authLevel < 5 ? null :
        <NavMenuItem to="/cms">
            Admin Panel
        </NavMenuItem>
        }
        { user.authLevel < 5 ? null :
            <NavMenuItem to="/auth/project-management">
            Manage Users
            </NavMenuItem>
        }
        <NavMenuItem to="/auth/profile">
          Profile
        </NavMenuItem>
        <NavMenuSeparator />
        <NavMenuItem to="/auth/logout">
          Logout
        </NavMenuItem>
      </NavMenu>
      }
    </div>
  )
})
