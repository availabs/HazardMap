import React  from "react"
// import {SideNav} from 'components/avl-components/components'
import {useTheme} from "components/avl-components/wrappers/with-theme"

const AdminLayout = ({children}) => {
	const theme = useTheme()
	return (
	  	<div className="w-full">
	  		<div className="flex min-h-screen">
		    	<div className={`flex-1 md:ml-${theme.sidebarW}`}>	
	    			{children}
	    		</div>
	    	</div>
		</div>
	)
}

export default AdminLayout