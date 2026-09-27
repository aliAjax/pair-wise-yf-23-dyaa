# 舞台灯光编排模拟器

纯前端舞台灯光编排工具，支持灯具通道、场景 Cue、时间轴预览和演出方案导出，所有数据存在 IndexedDB。

## 快速启动

```bash
cp .env.example .env && docker compose up -d
```

## 访问地址或 CLI 示例

前端：<http://localhost:20113>



## 本地开发方式

- 前端：`cd frontend && npm install && npm run dev`



## 技术栈

| 层 | 技术 |
|---|---|
| 前端 | React 18 + TypeScript + Vite + Tailwind CSS + Redux Toolkit + IndexedDB |
| 后端 | - |
| 数据库 | 本地模拟数据 |
| 部署 | Docker Compose |

## 项目目录结构

```text
frontend/src/api, stores, types, constants, constructors, components/common, hooks, pages, router, utils, mocks
```

## 环境变量说明

- `COMPOSE_PROJECT_NAME`: Compose 项目名，默认 `stage-light`
- `FRONTEND_PORT`: 前端端口，默认 `20113`


## Docker 部署说明

- 根 Compose 文件不写 `version`，顶层 `name: stage-light`。
- 容器名均使用 `${COMPOSE_PROJECT_NAME:-stage-light}` 前缀。
- 数据库使用命名卷，避免绑定中文路径。
- 常见问题：端口占用时修改 `.env` 中端口后重启；需要重置数据时执行 `docker compose down -v`。

## 枚举/常量出现位置清单

- FixtureType: constants/FixtureType、types/FixtureType、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- CueStatus: constants/CueStatus、types/CueStatus、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- ChannelMode: constants/ChannelMode、types/ChannelMode、constructors、logTemplates、errorMessages、筛选器、展示组件/控制器均有引用。
- RiggingStatus: constants/RiggingStatus、constants/statusText、types/Rigging、constructors/RiggingConstructor、api/Rigging、stores/RiggingStore、灯具布置（吊挂复核台）页面均有引用。

## 吊挂复核台（灯具布置 `/fixtures`）

录入灯具编号、类型、吊杆、横向位置（厘米）、重量（公斤）、功率（瓦）后提交复核：

- 同一吊杆上相邻灯具中心间距不足 **80 厘米**（`constants/RiggingRules.MIN_SPACING_CM`）判为碰肩冲突，并指出冲突的两盏灯编号。
- 同一吊杆总重超过 **650 公斤**（`constants/RiggingRules.MAX_BAR_WEIGHT_KG`）判为超重。
- 存在任一冲突时本次摆放只写入草稿键 `stage-light:rigging-draft`，已入库灯位（`stage-light:rigging-layout`）与场景引用照旧；复核通过后整杆布局才正式写入浏览器，清除草稿，切换页面回来仍能看到最后一次摆放。
- 校验逻辑在 `utils/riggingCheck.ts`，本地读写在 `api/Rigging.ts`，状态在 `stores/RiggingStore.ts`，相关组件为 `components/common/RiggingFormTable`、`BoomBarStrip`、`RiggingConflictPanel`。

## 为什么会牵一发动全身

实体字段、枚举、日志模板、错误消息、构造器、筛选器和展示组件被刻意拆散到多个目录；修改一个状态值通常需要同步类型、构造器、服务、控制器、store、页面、README 与数据库种子。

## License

MIT
