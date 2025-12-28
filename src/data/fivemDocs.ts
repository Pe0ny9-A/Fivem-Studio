export interface DocSection {
  id: string
  title: string
  content: string
  category: string
}

export interface DocCategory {
  id: string
  name: string
  icon: string
  sections: DocSection[]
}

export const fivemDocs: DocCategory[] = [
  {
    id: 'getting-started',
    name: '快速开始',
    icon: '🚀',
    sections: [
      {
        id: 'what-is-fivem',
        title: '什么是FiveM？',
        category: 'getting-started',
        content: `# 什么是FiveM？

FiveM是一个允许你运行自定义GTA V多人游戏服务器的修改框架。它允许你创建完全自定义的多人游戏体验。

## 主要特性

- **完全自定义**: 创建你自己的游戏模式和功能
- **Lua脚本**: 使用Lua编写服务器端和客户端脚本
- **JavaScript支持**: 也可以使用JavaScript进行开发
- **资源系统**: 模块化的资源系统，易于管理和分享
- **强大的API**: 丰富的原生函数和事件系统

## 开始使用

1. 下载并安装FiveM客户端
2. 设置服务器
3. 创建你的第一个资源
4. 使用本工具开发你的资源`,
      },
      {
        id: 'first-resource',
        title: '创建第一个资源',
        category: 'getting-started',
        content: `# 创建第一个资源

## 步骤1: 创建资源文件夹

在你的服务器资源目录中创建一个新文件夹，例如 \`my-resource\`。

## 步骤2: 创建fxmanifest.lua

每个资源都需要一个 \`fxmanifest.lua\` 文件。这是资源的配置文件。

\`\`\`lua
fx_version 'cerulean'
game 'gta5'

author 'Your Name'
description 'My First Resource'
version '1.0.0'

client_scripts {
    'client/main.lua'
}

server_scripts {
    'server/main.lua'
}
\`\`\`

## 步骤3: 创建脚本文件

创建 \`client/main.lua\` 和 \`server/main.lua\` 文件。

### client/main.lua
\`\`\`lua
-- 客户端脚本
Citizen.CreateThread(function()
    print("Hello from client!")
end)
\`\`\`

### server/main.lua
\`\`\`lua
-- 服务端脚本
print("Hello from server!")
\`\`\`

## 步骤4: 启动资源

在服务器控制台中输入：
\`\`\`
ensure my-resource
\`\`\``,
      },
    ],
  },
  {
    id: 'manifest',
    name: '配置文件',
    icon: '⚙️',
    sections: [
      {
        id: 'fxmanifest-basics',
        title: 'fxmanifest.lua 基础',
        category: 'manifest',
        content: `# fxmanifest.lua 基础

\`fxmanifest.lua\` 是每个FiveM资源必需的配置文件。它告诉FiveM如何加载和使用你的资源。

## 基本结构

\`\`\`lua
fx_version 'cerulean'
game 'gta5'

-- 资源信息
author 'Your Name'
description 'Resource Description'
version '1.0.0'

-- 脚本文件
client_scripts {
    'client/*.lua'
}

server_scripts {
    'server/*.lua'
}

shared_scripts {
    'shared/*.lua'
}
\`\`\`

## 常用字段说明

### fx_version
指定资源使用的FiveM版本。常用值：
- \`'cerulean'\` - 最新稳定版
- \`'bodacious'\` - 较旧版本

### game
指定游戏版本：
- \`'gta5'\` - GTA V

### client_scripts
客户端脚本列表，在客户端运行。

### server_scripts
服务端脚本列表，在服务器运行。

### shared_scripts
共享脚本，在客户端和服务端都运行。

### files
需要加载的文件列表（如HTML、CSS、JS等）。

### dependencies
资源依赖的其他资源。`,
      },
      {
        id: 'manifest-advanced',
        title: '高级配置',
        category: 'manifest',
        content: `# fxmanifest.lua 高级配置

## UI页面

\`\`\`lua
ui_page 'html/index.html'

files {
    'html/index.html',
    'html/style.css',
    'html/script.js'
}
\`\`\`

## 依赖管理

\`\`\`lua
dependencies {
    'es_extended',  -- ESX框架
    'qb-core'      -- QBCore框架
}
\`\`\`

## 加载屏幕

\`\`\`lua
loadscreen 'loadscreen/index.html'
loadscreen_manual_shutdown 'yes'
\`\`\`

## 提供文件

\`\`\`lua
provides {
    'old-resource-name'  -- 提供旧资源名称的兼容性
}
\`\`\`

## 数据文件

\`\`\`lua
data_file 'HANDLING_FILE' 'data/handling.meta'
data_file 'VEHICLE_LAYOUTS_FILE' 'data/vehiclelayouts.meta'
\`\`\``,
      },
    ],
  },
  {
    id: 'scripting',
    name: '脚本编写',
    icon: '📝',
    sections: [
      {
        id: 'client-scripts',
        title: '客户端脚本',
        category: 'scripting',
        content: `# 客户端脚本

客户端脚本在玩家的游戏中运行，可以访问游戏世界、玩家、实体等。

## 基本结构

\`\`\`lua
-- 客户端脚本示例
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        -- 你的代码
    end
end)
\`\`\`

## 常用原生函数

### 获取玩家坐标
\`\`\`lua
local playerPed = PlayerPedId()
local coords = GetEntityCoords(playerPed)
print("Player position: " .. coords.x .. ", " .. coords.y .. ", " .. coords.z)
\`\`\`

### 显示通知
\`\`\`lua
-- ESX
ESX.ShowNotification("Hello!")

-- QBCore
QBCore.Functions.Notify("Hello!", "success")
\`\`\`

### 触发服务端事件
\`\`\`lua
TriggerServerEvent('myResource:doSomething', data)
\`\`\`

### 监听服务端事件
\`\`\`lua
RegisterNetEvent('myResource:something')
AddEventHandler('myResource:something', function(data)
    -- 处理事件
end)
\`\`\``,
      },
      {
        id: 'server-scripts',
        title: '服务端脚本',
        category: 'scripting',
        content: `# 服务端脚本

服务端脚本在服务器上运行，处理数据、数据库操作、权限检查等。

## 基本结构

\`\`\`lua
-- 服务端脚本示例
RegisterServerEvent('myResource:doSomething')
AddEventHandler('myResource:doSomething', function(data)
    -- 处理逻辑
end)
\`\`\`

## 常用功能

### 获取玩家信息
\`\`\`lua
-- ESX
local xPlayer = ESX.GetPlayerFromId(source)
local identifier = xPlayer.identifier

-- QBCore
local Player = QBCore.Functions.GetPlayer(source)
local citizenid = Player.PlayerData.citizenid
\`\`\`

### 数据库操作
\`\`\`lua
-- MySQL异步查询
MySQL.Async.fetchAll('SELECT * FROM users WHERE id = @id', {
    ['@id'] = playerId
}, function(result)
    -- 处理结果
end)
\`\`\`

### 触发客户端事件
\`\`\`lua
TriggerClientEvent('myResource:updateClient', source, data)
\`\`\`

### 权限检查
\`\`\`lua
-- ESX
if xPlayer.getGroup() == 'admin' then
    -- 管理员操作
end

-- QBCore
if QBCore.Functions.HasPermission(source, 'admin') then
    -- 管理员操作
end
\`\`\``,
      },
      {
        id: 'events',
        title: '事件系统',
        category: 'scripting',
        content: `# 事件系统

FiveM使用事件系统进行客户端和服务端之间的通信。

## 客户端到服务端

\`\`\`lua
-- 客户端
TriggerServerEvent('myResource:eventName', data1, data2)

-- 服务端
RegisterServerEvent('myResource:eventName')
AddEventHandler('myResource:eventName', function(data1, data2)
    -- 处理数据
end)
\`\`\`

## 服务端到客户端

\`\`\`lua
-- 服务端
TriggerClientEvent('myResource:eventName', targetPlayerId, data1, data2)

-- 客户端
RegisterNetEvent('myResource:eventName')
AddEventHandler('myResource:eventName', function(data1, data2)
    -- 处理数据
end)
\`\`\`

## 广播事件

\`\`\`lua
-- 向所有客户端广播
TriggerClientEvent('myResource:eventName', -1, data)

-- 向所有客户端广播（服务端）
TriggerClientEvent('myResource:eventName', -1, data)
\`\`\`

## 事件命名规范

- 使用资源名称作为前缀：\`myResource:actionName\`
- 使用清晰的动词：\`get\`, \`set\`, \`update\`, \`delete\`
- 保持一致性`,
      },
    ],
  },
  {
    id: 'api',
    name: 'API参考',
    icon: '📚',
    sections: [
      {
        id: 'native-functions',
        title: '原生函数',
        category: 'api',
        content: `# 原生函数

FiveM提供了大量原生函数来与游戏交互。

## 玩家相关

\`\`\`lua
-- 获取玩家Ped
local playerPed = PlayerPedId()

-- 获取玩家坐标
local coords = GetEntityCoords(playerPed)

-- 获取玩家朝向
local heading = GetEntityHeading(playerPed)

-- 传送玩家
SetEntityCoords(playerPed, x, y, z, false, false, false, true)
\`\`\`

## 车辆相关

\`\`\`lua
-- 获取玩家车辆
local vehicle = GetVehiclePedIsIn(playerPed, false)

-- 获取车辆模型
local model = GetEntityModel(vehicle)

-- 设置车辆引擎状态
SetVehicleEngineOn(vehicle, true, true, true)
\`\`\`

## 世界相关

\`\`\`lua
-- 获取当前时间
local hour = GetClockHours()
local minute = GetClockMinutes()

-- 设置时间
NetworkOverrideClockTime(hour, minute, 0)

-- 设置天气
SetWeatherTypeNowPersist('CLEAR')
\`\`\`

## 更多信息

访问 [FiveM Native Reference](https://docs.fivem.net/natives/) 查看完整的原生函数列表。`,
      },
      {
        id: 'exports',
        title: '导出函数',
        category: 'api',
        content: `# 导出函数

导出函数允许其他资源调用你资源中的函数。

## 定义导出

\`\`\`lua
-- 服务端导出
exports('myFunction', function(param1, param2)
    -- 函数逻辑
    return result
end)

-- 客户端导出
exports('myClientFunction', function(param1)
    -- 函数逻辑
end)
\`\`\`

## 调用导出

\`\`\`lua
-- 调用其他资源的导出
local result = exports['otherResource']:myFunction(param1, param2)

-- 客户端调用
exports['otherResource']:myClientFunction(param1)
\`\`\`

## 使用场景

- 提供API给其他资源
- 模块化功能
- 资源间通信`,
      },
    ],
  },
  {
    id: 'best-practices',
    name: '最佳实践',
    icon: '✨',
    sections: [
      {
        id: 'code-organization',
        title: '代码组织',
        category: 'best-practices',
        content: `# 代码组织最佳实践

## 文件结构

\`\`\`
my-resource/
├── fxmanifest.lua
├── client/
│   ├── main.lua
│   ├── functions.lua
│   └── events.lua
├── server/
│   ├── main.lua
│   ├── database.lua
│   └── events.lua
├── shared/
│   └── config.lua
└── html/
    ├── index.html
    └── style.css
\`\`\`

## 命名规范

- 使用清晰的变量名
- 使用驼峰命名法
- 事件名称使用资源前缀

## 代码注释

\`\`\`lua
--[[
    函数说明
    @param param1 参数1说明
    @return 返回值说明
--]]
function myFunction(param1)
    -- 实现
end
\`\`\``,
      },
      {
        id: 'performance',
        title: '性能优化',
        category: 'best-practices',
        content: `# 性能优化

## 避免在循环中使用Wait(0)

\`\`\`lua
-- 不好
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(0)
        -- 频繁执行的代码
    end
end)

-- 好
Citizen.CreateThread(function()
    while true do
        Citizen.Wait(1000)  -- 每秒执行一次
        -- 代码
    end
end)
\`\`\`

## 使用本地变量

\`\`\`lua
-- 不好
for i = 1, 100 do
    local player = PlayerPedId()  -- 每次循环都调用
end

-- 好
local player = PlayerPedId()
for i = 1, 100 do
    -- 使用player
end
\`\`\`

## 避免不必要的网络事件

- 只在需要时触发网络事件
- 批量处理数据而不是频繁发送小数据包`,
      },
    ],
  },
]

export function getDocSection(categoryId: string, sectionId: string): DocSection | undefined {
  const category = fivemDocs.find(cat => cat.id === categoryId)
  return category?.sections.find(sec => sec.id === sectionId)
}

export function searchDocs(query: string): DocSection[] {
  const lowerQuery = query.toLowerCase()
  const results: DocSection[] = []
  
  fivemDocs.forEach(category => {
    category.sections.forEach(section => {
      if (
        section.title.toLowerCase().includes(lowerQuery) ||
        section.content.toLowerCase().includes(lowerQuery)
      ) {
        results.push(section)
      }
    })
  })
  
  return results
}

