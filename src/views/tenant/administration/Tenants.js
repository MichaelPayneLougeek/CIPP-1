import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faCog,
  faEdit,
  faEllipsisV,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons'
import { CippPageList } from 'src/components/layout'
import { CellTip, CellTipIcon } from 'src/components/tables'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import Skeleton from 'react-loading-skeleton'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const [getTenantDetails, tenantDetails] = useLazyGenericGetRequestQuery()
  const [ocVisible, setOCVisible] = useState(false)

  function loadOffCanvasDetails(domainName) {
    setOCVisible(true)
    getTenantDetails({ path: `api/ListTenantDetails?tenantfilter=${domainName}` })
  }

  function tenantProperty(tenantDetails, propertyName) {
    return (
      <>
        {tenantDetails.isFetching && <Skeleton count={1} width={150} />}
        {!tenantDetails.isFetching &&
          tenantDetails.isSuccess &&
          (tenantDetails.data[propertyName]?.toString() ?? ' ')}
      </>
    )
  }

  return (
    <>
      <CButton size="sm" color="link" onClick={() => loadOffCanvasDetails(row.defaultDomainName)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title="Tenant Information"
        extendedInfo={[
          {
            label: 'Display Name',
            value: tenantProperty(tenantDetails, 'displayName'),
          },
          {
            label: 'Business Phones',
            value: tenantProperty(tenantDetails, 'businessPhones'),
          },
          {
            label: 'Technical Emails',
            value: tenantProperty(tenantDetails, 'technicalNotificationMails'),
          },
          {
            label: 'Tenant Type',
            value: tenantProperty(tenantDetails, 'tenantType'),
          },
          {
            label: 'Created',
            value: tenantProperty(tenantDetails, 'createdDateTime'),
          },
          {
            label: 'AD Connect Enabled',
            value: tenantProperty(tenantDetails, 'onPremisesSyncEnabled'),
          },
          {
            label: 'AD Connect Sync',
            value: tenantProperty(tenantDetails, 'onPremisesLastSyncDateTime'),
          },
          {
            label: 'AD Password Sync',
            value: tenantProperty(tenantDetails, 'onPremisesLastPasswordSyncDateTime'),
          },
        ]}
        actions={[
          {
            icon: <FontAwesomeIcon icon={faEdit} className="me-2" />,
            label: 'Edit Tenant',
            link: `/tenant/administration/tenants/Edit?tenantFilter=${row.defaultDomainName}&customerId=${row.customerId}`,
            color: 'warning',
          },
          {
            icon: <FontAwesomeIcon icon={faCog} className="me-2" />,
            label: 'M365 Portal',
            link: `https://portal.office.com/Partner/BeginClientSession.aspx?CTID=${row.customerId}&CSDEST=o365admincenter`,
            external: true,
            color: 'info',
          },
          {
            icon: <FontAwesomeIcon icon={faCog} className="me-2" />,
            label: 'Exchange Portal',
            color: 'info',
            external: true,
            link: `https://outlook.office365.com/ecp/?rfr=Admin_o365&exsvurl=1&delegatedOrg=${row.defaultDomainName}`,
          },
          {
            icon: <FontAwesomeIcon icon={faCog} className="me-2" />,
            label: 'AAD Portal',
            color: 'info',
            external: true,
            link: `https://aad.portal.azure.com/${row.defaultDomainName}`,
          },
          {
            icon: <FontAwesomeIcon icon={faCog} className="me-2" />,
            label: 'Teams Portal',
            color: 'info',
            external: true,
            link: `https://admin.teams.microsoft.com/?delegatedOrg=${row.defaultDomainName}`,
          },
          {
            icon: <FontAwesomeIcon icon={faCog} className="me-2" />,
            label: 'Azure Portal',
            color: 'info',
            external: true,
            link: `https://portal.azure.com/${row.defaultDomainName}`,
          },
          {
            icon: <FontAwesomeIcon icon={faCog} className="me-2" />,
            label: 'MEM (Intune) Portal',
            color: 'info',
            external: true,
            link: `https://endpoint.microsoft.com/${row.defaultDomainName}`,
          },
          {
            icon: <FontAwesomeIcon icon={faCog} className="me-2" />,
            label: 'Security Portal (GDAP)',
            color: 'info',
            external: true,
            link: `https://security.microsoft.com/?tid=${row.customerId}`,
          },
          {
            icon: <FontAwesomeIcon icon={faCog} className="me-2" />,
            label: 'Sharepoint Admin',
            color: 'info',
            external: true,
            link: `https://${row.defaultDomainName.split('.')[0]}-admin.sharepoint.com`,
          },
        ]}
        placement="end"
        visible={ocVisible}
        id={row.id}
        hideFunction={() => setOCVisible(false)}
      />
    </>
  )
}

function StatusIcon(graphErrorCount) {
  if (graphErrorCount > 0) {
    return <FontAwesomeIcon icon={faExclamationTriangle} className="text-danger" />
  } else {
    return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />
  }
}

function StatusText(graphErrorCount, lastGraphError) {
  if (graphErrorCount > 0) {
    return 'Error Count: ' + graphErrorCount + ' - Last Error: ' + lastGraphError
  } else {
    return 'No errors detected with this tenant'
  }
}

const columns = [
  {
    name: 'Status',
    selector: (row) => row['GraphErrorCount'],
    sortable: true,
    cell: (row) =>
      CellTipIcon(
        StatusText(row['GraphErrorCount'], row['LastGraphError']),
        StatusIcon(row['GraphErrorCount']),
      ),
    exportSelector: 'GraphErrorCount',
    minWidth: '5px',
  },
  {
    name: 'Name',
    selector: (row) => row['displayName'],
    sortable: true,
    cell: (row) => CellTip(row['displayName']),
    exportSelector: 'displayName',
    minWidth: '250px',
  },
  {
    name: 'Default Domain',
    selector: (row) => row['defaultDomainName'],
    sortable: true,
    cell: (row) => CellTip(row['defaultDomainName']),
    exportSelector: 'defaultDomainName',
    minWidth: '200px',
  },
  {
    exportSelector: 'customerId',
  },
  {
    name: 'Actions',
    center: true,
    cell: Offcanvas,
  },
]

const TenantsList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      title="Tenants"
      tenantSelector={false}
      datatable={{
        keyField: 'id',
        columns,
        reportName: `${tenant.tenantId}-Tenants-List`,
        path: '/api/ListTenants',
      }}
    />
  )
}

export default TenantsList
