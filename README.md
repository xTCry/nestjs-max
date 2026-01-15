# NestJS Max

[![npm](https://img.shields.io/npm/v/nestjs-max.svg?style=flat-square)](https://www.npmjs.com/package/nestjs-max)
[![NPM](https://img.shields.io/npm/dt/nestjs-max.svg?style=flat-square)](https://www.npmjs.com/package/nestjs-max)
[![GitHub last commit](https://img.shields.io/github/last-commit/xtcry/nestjs-max)](https://github.com/xtcry/nestjs-max)

<img src="https://nestjs.com/img/logo-small.svg" title="NestJS logotype" align="right" width="95" height="148">

**NestJS Max** — библиотека для создания чат-ботов в мессенджере **Max**.

Этот модуль обеспечивает быстрый и простой способ взаимодействия с Max Bot API и создания ботов для мессенджера Max, а также глубокую интеграцию с вашим приложением NestJS.

### Установка

```bash
# NPM
npm i nestjs-max max-io

# Yarn
yarn add nestjs-max max-io
```

- Если работаете с `max-io/lib/session` через redis, то нужно установить доп. модуль `ioredis`
- Если работаете с `max-io/lib/i18n`, то понадобится модуль `js-yaml`

### Пример использования

#### 1. Минимум кода

Убедитесь, что в файле `.env` установлено значение для `BOT_TOKEN`

##### `main.ts`

```typescript
import 'dotenv/config';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

NestFactory.createApplicationContext(AppModule);

```

##### `app.module.ts`

```typescript
import { Module } from '@nestjs/common';
import { MaxModule } from 'nestjs-max';

import { BotUpdate } from './bot.update';

@Module({
  imports: [
    MaxModule.forRoot({
      token: process.env.BOT_TOKEN!,
      replyOptions: { markup: 'html' },
    }),
  ],
  providers: [BotUpdate],
})
export class AppModule {}
```

##### `bot.update.ts`

> Декораторы имеют префикс `Max` для удобной совместимости с другими библиотеками для Nest. Можно экспортировать и без префикса

```typescript
import {
  MaxContext, // Ctx
  MaxHears, // Hears
  MaxOn, // On
  MaxReplyOptions, // ReplyOptions
  MaxStarted, // Started
  MaxStartPayload, // StartPayload
  MaxUpdate, // Update
} from 'nestjs-max';
import { type Context } from 'max-io';
import type { MessageCreatedUpdate } from 'max-io/lib/core/network/api';

@MaxUpdate()
export class BotUpdate {
  @MaxStarted()
  onStarted(@MaxStartPayload() payload?: string | null) {
    console.log('[onStarted] Info: ', { payload });
    return 'HelloW! Use /start';
  }

  @MaxHears(/(.*)/i)
  onBroke(@MaxContext() ctx: Context<MessageCreatedUpdate>) {
    ctx.reply('Hmm...');
  }

  @MaxReplyOptions({ replyTo: true })
  @MaxOn('message_edited')
  async onMsgEdited() {
    return 'I see that 👀...';
  }
}
```

#### 2. Проект в [sample](/sample/01-max-minimum/)

 - Установить значения в `.env`
 - Запустить `npm install`
 - Запустить `npm run start:dev`

Для получения ID своего профиля исользовать комануд `/id`.
Полученный ID указать в `.env` файле для `MAX_BOT_ADMIN_IDS` и/или `MAX_BOT_USER_IDS`

Команды для проверки различных сценариев с ролями: `/admin`, `/admins`, `/user`
