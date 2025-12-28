import { CodeSnippet, SnippetCategory } from '@/types/snippet'

export const fivemSnippets: CodeSnippet[] = [
  {
    id: 'register-command',
    name: 'RegisterCommand',
    description: '注册客户端命令',
    prefix: 'regcmd',
    scope: 'lua',
    category: 'commands',
    tags: ['command', 'client'],
    body: [
      'RegisterCommand(\'${1:commandName}\', function(source, args, rawCommand)',
      '    ${2:-- 命令逻辑}',
      'end, false)'
    ],
  },
  {
    id: 'add-event-handler',
    name: 'AddEventHandler',
    description: '添加事件处理器',
    prefix: 'addevent',
    scope: 'lua',
    category: 'events',
    tags: ['event', 'handler'],
    body: [
      'AddEventHandler(\'${1:eventName}\', function(${2:...args})',
      '    ${3:-- 事件处理逻辑}',
      'end)'
    ],
  },
  {
    id: 'register-net-event',
    name: 'RegisterNetEvent',
    description: '注册网络事件',
    prefix: 'regnet',
    scope: 'lua',
    category: 'events',
    tags: ['net', 'event'],
    body: [
      'RegisterNetEvent(\'${1:eventName}\')',
      'AddEventHandler(\'${1:eventName}\', function(${2:...args})',
      '    ${3:-- 事件处理逻辑}',
      'end)'
    ],
  },
  {
    id: 'create-thread',
    name: 'CreateThread',
    description: '创建线程',
    prefix: 'thread',
    scope: 'lua',
    category: 'threads',
    tags: ['thread', 'async'],
    body: [
      'CreateThread(function()',
      '    while true do',
      '        ${1:-- 线程逻辑}',
      '        Wait(${2:1000})',
      '    end',
      'end)'
    ],
  },
  {
    id: 'create-callback',
    name: 'CreateCallback',
    description: '创建服务器回调',
    prefix: 'callback',
    scope: 'lua',
    category: 'server',
    tags: ['callback', 'server'],
    body: [
      'CreateCallback(\'${1:callbackName}\', function(source, cb, ${2:...args})',
      '    ${3:-- 回调逻辑}',
      '    cb(${4:result})',
      'end)'
    ],
  },
  {
    id: 'trigger-server-event',
    name: 'TriggerServerEvent',
    description: '触发服务器事件',
    prefix: 'triggerserver',
    scope: 'lua',
    category: 'events',
    tags: ['event', 'server'],
    body: [
      'TriggerServerEvent(\'${1:eventName}\', ${2:...args})'
    ],
  },
  {
    id: 'trigger-client-event',
    name: 'TriggerClientEvent',
    description: '触发客户端事件',
    prefix: 'triggerclient',
    scope: 'lua',
    category: 'events',
    tags: ['event', 'client'],
    body: [
      'TriggerClientEvent(\'${1:eventName}\', ${2:source}, ${3:...args})'
    ],
  },
  {
    id: 'get-player',
    name: 'GetPlayer',
    description: '获取玩家对象',
    prefix: 'getplayer',
    scope: 'lua',
    category: 'players',
    tags: ['player'],
    body: [
      'local xPlayer = ${1:ESX}.GetPlayerFromId(${2:source})',
      'if xPlayer then',
      '    ${3:-- 玩家逻辑}',
      'end'
    ],
  },
  {
    id: 'spawn-vehicle',
    name: 'SpawnVehicle',
    description: '生成车辆',
    prefix: 'spawnveh',
    scope: 'lua',
    category: 'vehicles',
    tags: ['vehicle', 'spawn'],
    body: [
      'local vehicle = CreateVehicle(GetHashKey(\'${1:vehicleModel}\'), ${2:x}, ${3:y}, ${4:z}, ${5:heading}, true, false)',
      'SetEntityAsMissionEntity(vehicle, true, true)',
      'SetVehicleOnGroundProperly(vehicle)'
    ],
  },
  {
    id: 'notification',
    name: 'Notification',
    description: '显示通知',
    prefix: 'notify',
    scope: 'lua',
    category: 'ui',
    tags: ['notification', 'ui'],
    body: [
      '${1:ESX}.ShowNotification(\'${2:message}\')'
    ],
  },
  {
    id: 'fxmanifest-basic',
    name: 'fxmanifest.lua Basic',
    description: '基础fxmanifest.lua模板',
    prefix: 'fxmanifest',
    scope: 'lua',
    category: 'manifest',
    tags: ['manifest', 'config'],
    body: [
      'fx_version \'cerulean\'',
      'game \'gta5\'',
      '',
      'author \'${1:YourName}\'',
      'description \'${2:Resource Description}\'',
      'version \'${3:1.0.0}\'',
      '',
      'client_scripts {',
      '    \'client/*.lua\'',
      '}',
      '',
      'server_scripts {',
      '    \'server/*.lua\'',
      '}'
    ],
  },
  {
    id: 'export-function',
    name: 'Export Function',
    description: '导出函数',
    prefix: 'export',
    scope: 'lua',
    category: 'exports',
    tags: ['export', 'function'],
    body: [
      'exports(\'${1:resourceName}\'):${2:functionName}(${3:...args})'
    ],
  },
]

export const snippetCategories: SnippetCategory[] = [
  {
    id: 'commands',
    name: '命令',
    icon: '⌨️',
    snippets: fivemSnippets.filter(s => s.category === 'commands'),
  },
  {
    id: 'events',
    name: '事件',
    icon: '📡',
    snippets: fivemSnippets.filter(s => s.category === 'events'),
  },
  {
    id: 'threads',
    name: '线程',
    icon: '🔄',
    snippets: fivemSnippets.filter(s => s.category === 'threads'),
  },
  {
    id: 'server',
    name: '服务器',
    icon: '🖥️',
    snippets: fivemSnippets.filter(s => s.category === 'server'),
  },
  {
    id: 'players',
    name: '玩家',
    icon: '👤',
    snippets: fivemSnippets.filter(s => s.category === 'players'),
  },
  {
    id: 'vehicles',
    name: '车辆',
    icon: '🚗',
    snippets: fivemSnippets.filter(s => s.category === 'vehicles'),
  },
  {
    id: 'ui',
    name: 'UI',
    icon: '🎨',
    snippets: fivemSnippets.filter(s => s.category === 'ui'),
  },
  {
    id: 'manifest',
    name: '配置文件',
    icon: '📄',
    snippets: fivemSnippets.filter(s => s.category === 'manifest'),
  },
  {
    id: 'exports',
    name: '导出',
    icon: '📤',
    snippets: fivemSnippets.filter(s => s.category === 'exports'),
  },
]

