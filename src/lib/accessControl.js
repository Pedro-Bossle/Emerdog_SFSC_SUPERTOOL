export const ACCESS_PROFILE_STORAGE_KEY = 'sfsc-access-profile'

export const PERMISSION_KEYS = {
  ACCESS_MANAGE: 'access.manage',
  SUPERTABELA_VIEW: 'supertabela.view',
  SUPERTABELA_EDIT: 'supertabela.edit',
  SUPERTABELA_DELETE_BY_LIST: 'supertabela.tools.deleteByList',
  CREDENCIAMENTO_VIEW: 'credenciamento.view',
  CREDENCIAMENTO_EDIT: 'credenciamento.edit',
}

export const PERMISSOES = [
  {
    grupo: 'Administrativo',
    itens: [
      {
        chave: PERMISSION_KEYS.ACCESS_MANAGE,
        rotulo: 'Gerenciar acessos',
        descricao: 'Pode abrir a tela administrativa, convidar usuarios e alterar permissoes.',
      },
    ],
  },
  {
    grupo: 'Super-Tabela',
    itens: [
      {
        chave: PERMISSION_KEYS.SUPERTABELA_VIEW,
        rotulo: 'Ver Super-Tabela',
        descricao: 'Pode acessar as telas da Super-Tabela.',
      },
      {
        chave: PERMISSION_KEYS.SUPERTABELA_EDIT,
        rotulo: 'Editar Super-Tabela',
        descricao: 'Pode criar, editar e excluir dados da Super-Tabela.',
      },
      {
        chave: PERMISSION_KEYS.SUPERTABELA_DELETE_BY_LIST,
        rotulo: 'Usar Exclusao por lista',
        descricao: 'Pode usar a ferramenta momentanea de exclusao em massa por lista.',
      },
    ],
  },
  {
    grupo: 'Credenciamento',
    itens: [
      {
        chave: PERMISSION_KEYS.CREDENCIAMENTO_VIEW,
        rotulo: 'Ver Credenciamento',
        descricao: 'Pode acessar as telas de Credenciamento.',
      },
      {
        chave: PERMISSION_KEYS.CREDENCIAMENTO_EDIT,
        rotulo: 'Editar Credenciamento',
        descricao: 'Pode alterar dados de Credenciamento.',
      },
    ],
  },
]

export const DEFAULT_PROFILE_PERMISSIONS = {
  [PERMISSION_KEYS.SUPERTABELA_VIEW]: true,
  [PERMISSION_KEYS.SUPERTABELA_EDIT]: true,
  [PERMISSION_KEYS.SUPERTABELA_DELETE_BY_LIST]: false,
  [PERMISSION_KEYS.CREDENCIAMENTO_VIEW]: true,
  [PERMISSION_KEYS.CREDENCIAMENTO_EDIT]: true,
  [PERMISSION_KEYS.ACCESS_MANAGE]: false,
}

export const DEFAULT_INVITED_PERMISSIONS = {
  [PERMISSION_KEYS.SUPERTABELA_VIEW]: true,
  [PERMISSION_KEYS.SUPERTABELA_EDIT]: false,
  [PERMISSION_KEYS.SUPERTABELA_DELETE_BY_LIST]: false,
  [PERMISSION_KEYS.CREDENCIAMENTO_VIEW]: true,
  [PERMISSION_KEYS.CREDENCIAMENTO_EDIT]: false,
  [PERMISSION_KEYS.ACCESS_MANAGE]: false,
}

export const normalizarPermissions = (profile = {}) => {
  const raw = profile?.permissions && typeof profile.permissions === 'object' ? profile.permissions : {}
  const temPermissions = Object.keys(raw).length > 0
  const legadoCredReadonly = !!profile?.credenciamento_read_only

  const base = temPermissions
    ? { ...DEFAULT_INVITED_PERMISSIONS }
    : {
        ...DEFAULT_PROFILE_PERMISSIONS,
        [PERMISSION_KEYS.CREDENCIAMENTO_EDIT]: !legadoCredReadonly,
      }

  return {
    ...base,
    ...raw,
  }
}

export const normalizarProfileAcesso = (profile = {}) => ({
  id: profile?.id || null,
  name: profile?.name || '',
  email: profile?.email || '',
  credenciamento_read_only: !!profile?.credenciamento_read_only,
  permissions: normalizarPermissions(profile),
})

export const hasPermission = (profileOrPermissions, key) => {
  const permissions = profileOrPermissions?.permissions || profileOrPermissions || {}
  return !!permissions[key]
}

export const hasAnyPermission = (profileOrPermissions, keys = []) =>
  keys.some((key) => hasPermission(profileOrPermissions, key))

export const usuarioSomenteLeituraGlobal = (profileOrPermissions) =>
  !hasAnyPermission(profileOrPermissions, [
    PERMISSION_KEYS.SUPERTABELA_EDIT,
    PERMISSION_KEYS.CREDENCIAMENTO_EDIT,
    PERMISSION_KEYS.ACCESS_MANAGE,
  ])

export const setStoredAccessProfile = (profile) => {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(ACCESS_PROFILE_STORAGE_KEY, JSON.stringify(normalizarProfileAcesso(profile)))
}

export const getStoredAccessProfile = () => {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(ACCESS_PROFILE_STORAGE_KEY)
    return raw ? normalizarProfileAcesso(JSON.parse(raw)) : null
  } catch {
    return null
  }
}

export const clearStoredAccessProfile = () => {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(ACCESS_PROFILE_STORAGE_KEY)
}

export const hasStoredPermission = (key) => hasPermission(getStoredAccessProfile(), key)
