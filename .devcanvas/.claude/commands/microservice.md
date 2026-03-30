---
description: Microservice — NestJS modules, services, controllers, messaging, and patterns
allowed-tools: Bash, Read, Write, Glob, Grep, Edit
argument-hint: [init|module|service|controller|guard|pipe|queue|gateway|test|debug] [action]
---

# Microservice

Unified command for microservice development with NestJS as the default framework. Covers modules, services, controllers, guards, pipes, messaging, gateways, testing, and debugging.

## Instructions

### Route by Subcommand

Parse `$ARGUMENTS` to determine the area and action:

- `init [action]` — Initialize NestJS project
- `module [action]` — Module scaffolding
- `service [action]` — Service layer patterns
- `controller [action]` — Controller and route handling
- `guard [action]` — Guards, interceptors, pipes, filters
- `pipe [action]` — Validation pipes and transformers
- `queue [action]` — Message queues and event-driven patterns
- `gateway [action]` — API Gateway and WebSocket gateways
- `test [action]` — Testing patterns
- `debug [action]` — Debugging and troubleshooting
- No arguments — Show microservice overview

---

## Overview (default, no arguments)

Show NestJS project status:

```bash
# Check NestJS CLI
npx nest --version 2>/dev/null

# Check project structure
ls src/ 2>/dev/null
cat nest-cli.json 2>/dev/null

# List modules
find src -name "*.module.ts" ! -path "*/node_modules/*" | sort
```

Display format:
```
Microservice Overview
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Framework:   NestJS 10
Type:        REST API + Microservice
Transport:   HTTP, Redis (pub/sub)

Modules:
  AppModule
  ├── AuthModule
  ├── UsersModule
  ├── PostsModule
  ├── NotificationsModule
  └── SharedModule

Services:    12
Controllers: 8
Guards:      3
Pipes:       2

Quick Actions:
  /microservice module users     Create module
  /microservice service users    Create service
  /microservice guard auth       Create guard
  /microservice test             Run tests
```

---

## Init — Initialize Project

### `init` — Create NestJS project

```bash
npx @nestjs/cli new my-service
# or with specific package manager:
npx @nestjs/cli new my-service --package-manager pnpm
```

### `init monorepo` — Create NestJS monorepo

```bash
npx @nestjs/cli new my-workspace --monorepo
npx nest generate app api-gateway
npx nest generate app user-service
npx nest generate app notification-service
npx nest generate library shared
```

### `init microservice` — Setup as microservice (non-HTTP)

```typescript
// main.ts
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.REDIS,
      options: {
        host: 'localhost',
        port: 6379,
      },
    },
  )
  await app.listen()
}
bootstrap()
```

### `init hybrid` — Setup as hybrid (HTTP + Microservice)

```typescript
// main.ts
import { NestFactory } from '@nestjs/core'
import { MicroserviceOptions, Transport } from '@nestjs/microservices'
import { ValidationPipe } from '@nestjs/common'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Add microservice transport
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.REDIS,
    options: { host: 'localhost', port: 6379 },
  })

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))
  app.enableCors()

  await app.startAllMicroservices()
  await app.listen(3000)
}
bootstrap()
```

### Project Structure

```
src/
├── main.ts
├── app.module.ts
├── app.controller.ts
├── app.service.ts
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   └── pipes/
├── config/
│   └── configuration.ts
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── auth.guard.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   └── local.strategy.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   ├── users.repository.ts
│   │   ├── entities/
│   │   │   └── user.entity.ts
│   │   └── dto/
│   │       ├── create-user.dto.ts
│   │       └── update-user.dto.ts
│   └── shared/
│       └── shared.module.ts
└── prisma/
    ├── prisma.module.ts
    └── prisma.service.ts
```

---

## Module — Module Scaffolding

### `module <name>` — Generate module

```bash
npx nest generate module modules/<name>
# or shorthand:
npx nest g mo modules/<name>
```

### `module full <name>` — Generate full module (module + controller + service)

```bash
npx nest g resource modules/<name>
# Prompts for: REST API, GraphQL, Microservice, WebSocket
```

### Module Pattern

```typescript
// modules/users/users.module.ts
import { Module } from '@nestjs/common'
import { UsersController } from './users.controller'
import { UsersService } from './users.service'
import { PrismaModule } from '../../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
```

### `module dynamic` — Dynamic module pattern

```typescript
// config/config.module.ts
import { Module, DynamicModule } from '@nestjs/common'

@Module({})
export class ConfigModule {
  static forRoot(options: ConfigOptions): DynamicModule {
    return {
      module: ConfigModule,
      global: true,
      providers: [
        { provide: CONFIG_OPTIONS, useValue: options },
        ConfigService,
      ],
      exports: [ConfigService],
    }
  }
}
```

---

## Service — Service Layer

### `service <name>` — Generate service

```bash
npx nest g service modules/<name>
# or: npx nest g s modules/<name>
```

### Service Pattern

```typescript
// modules/users/users.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PaginationDto } from '../../common/dto/pagination.dto'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PaginationDto) {
    const { page = 1, limit = 20, search } = query
    const skip = (page - 1) * limit

    const [data, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({
        where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      }),
    ])

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new NotFoundException(`User #${id} not found`)
    return user
  }

  async create(dto: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (existing) throw new ConflictException('Email already registered')

    return this.prisma.user.create({ data: dto })
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id) // throws if not found
    return this.prisma.user.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOne(id)
    return this.prisma.user.delete({ where: { id } })
  }
}
```

### `service prisma` — Prisma service setup

```typescript
// prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect()
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}

// prisma/prisma.module.ts
import { Global, Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

### `service patterns` — Common service patterns

**Repository pattern:**
```typescript
@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string) { return this.prisma.user.findUnique({ where: { id } }) }
  findByEmail(email: string) { return this.prisma.user.findUnique({ where: { email } }) }
  create(data: CreateUserDto) { return this.prisma.user.create({ data }) }
  update(id: string, data: UpdateUserDto) { return this.prisma.user.update({ where: { id }, data }) }
  delete(id: string) { return this.prisma.user.delete({ where: { id } }) }
}
```

**Event emitter:**
```typescript
import { EventEmitter2 } from '@nestjs/event-emitter'

@Injectable()
export class UsersService {
  constructor(private eventEmitter: EventEmitter2) {}

  async create(dto: CreateUserDto) {
    const user = await this.prisma.user.create({ data: dto })
    this.eventEmitter.emit('user.created', user)
    return user
  }
}

// Listener
@Injectable()
export class NotificationsService {
  @OnEvent('user.created')
  handleUserCreated(user: User) {
    // Send welcome email
  }
}
```

---

## Controller — Controllers

### `controller <name>` — Generate controller

```bash
npx nest g controller modules/<name>
# or: npx nest g co modules/<name>
```

### Controller Pattern

```typescript
// modules/users/users.controller.ts
import { Controller, Get, Post, Patch, Delete, Body, Param, Query, HttpCode, HttpStatus, UseGuards } from '@nestjs/common'
import { UsersService } from './users.service'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { PaginationDto } from '../../common/dto/pagination.dto'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger'

@ApiTags('users')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List all users' })
  findAll(@Query() query: PaginationDto) {
    return this.usersService.findAll(query)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 404, description: 'User not found' })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create user' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user' })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id)
  }
}
```

### DTO Patterns

```typescript
// dto/create-user.dto.ts
import { IsString, IsEmail, IsEnum, MinLength, IsOptional } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @MinLength(2)
  name: string

  @ApiProperty({ example: 'john@example.com' })
  @IsEmail()
  email: string

  @ApiPropertyOptional({ enum: ['user', 'admin'], default: 'user' })
  @IsOptional()
  @IsEnum(['user', 'admin'])
  role?: string = 'user'
}

// dto/update-user.dto.ts
import { PartialType } from '@nestjs/swagger'
import { CreateUserDto } from './create-user.dto'

export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

---

## Guard — Guards, Interceptors, Filters

### `guard <name>` — Generate guard

```bash
npx nest g guard common/guards/<name>
```

### Auth Guard (JWT)

```typescript
// modules/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Reflector } from '@nestjs/core'
import { IS_PUBLIC_KEY } from '../../common/decorators/public.decorator'

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) { super() }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (isPublic) return true
    return super.canActivate(context)
  }

  handleRequest(err: any, user: any) {
    if (err || !user) throw new UnauthorizedException()
    return user
  }
}

// common/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common'
export const IS_PUBLIC_KEY = 'isPublic'
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true)
```

### Roles Guard

```typescript
// common/guards/roles.guard.ts
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ])
    if (!roles) return true
    const { user } = context.switchToHttp().getRequest()
    return roles.includes(user.role)
  }
}

// Usage
@Roles('admin')
@UseGuards(RolesGuard)
@Delete(':id')
remove(@Param('id') id: string) {}
```

### Exception Filter

```typescript
// common/filters/http-exception.filter.ts
import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()
    const request = ctx.getRequest()

    const status = exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR

    const message = exception instanceof HttpException
      ? exception.getResponse()
      : 'Internal server error'

    response.status(status).json({
      error: {
        code: HttpStatus[status],
        message: typeof message === 'string' ? message : (message as any).message,
        timestamp: new Date().toISOString(),
        path: request.url,
      },
    })
  }
}
```

### Logging Interceptor

```typescript
// common/interceptors/logging.interceptor.ts
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common'
import { Observable, tap } from 'rxjs'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger('HTTP')

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest()
    const { method, url } = req
    const now = Date.now()

    return next.handle().pipe(
      tap(() => this.logger.log(`${method} ${url} ${Date.now() - now}ms`)),
    )
  }
}
```

---

## Queue — Message Queues

### `queue` — Queue overview

### `queue bull` — BullMQ setup

```bash
npm install @nestjs/bullmq bullmq
```

```typescript
// app.module.ts
import { BullModule } from '@nestjs/bullmq'

@Module({
  imports: [
    BullModule.forRoot({
      connection: { host: 'localhost', port: 6379 },
    }),
    BullModule.registerQueue({ name: 'email' }),
    BullModule.registerQueue({ name: 'notifications' }),
  ],
})
export class AppModule {}
```

**Producer:**
```typescript
import { InjectQueue } from '@nestjs/bullmq'
import { Queue } from 'bullmq'

@Injectable()
export class EmailService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendWelcomeEmail(userId: string) {
    await this.emailQueue.add('welcome', { userId }, {
      delay: 5000,
      attempts: 3,
      backoff: { type: 'exponential', delay: 1000 },
    })
  }
}
```

**Consumer:**
```typescript
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { Job } from 'bullmq'

@Processor('email')
export class EmailProcessor extends WorkerHost {
  async process(job: Job) {
    switch (job.name) {
      case 'welcome':
        await this.sendWelcome(job.data.userId)
        break
    }
  }

  private async sendWelcome(userId: string) {
    // Send email logic
  }
}
```

### `queue events` — Event-driven patterns

```typescript
// Event emitter (in-process)
import { EventEmitterModule } from '@nestjs/event-emitter'

@Module({
  imports: [EventEmitterModule.forRoot()],
})
export class AppModule {}

// Emit
this.eventEmitter.emit('order.created', { orderId, userId })

// Listen
@OnEvent('order.created')
handleOrderCreated(payload: OrderCreatedEvent) {}
```

### `queue microservice` — Microservice messaging

```typescript
// Redis transport
@Controller()
export class AppController {
  @MessagePattern('user.get')
  getUser(@Payload() data: { id: string }) {
    return this.usersService.findOne(data.id)
  }

  @EventPattern('user.created')
  handleUserCreated(@Payload() data: UserCreatedEvent) {
    // Handle event (fire-and-forget)
  }
}

// Client (from another service)
@Injectable()
export class UsersClient {
  constructor(@Inject('USER_SERVICE') private client: ClientProxy) {}

  getUser(id: string) {
    return this.client.send('user.get', { id })
  }

  notifyUserCreated(user: User) {
    this.client.emit('user.created', user)
  }
}
```

### Transport Options

| Transport | Use Case |
|-----------|----------|
| `Transport.TCP` | Simple, low overhead |
| `Transport.REDIS` | Pub/sub, good for events |
| `Transport.NATS` | High-performance messaging |
| `Transport.KAFKA` | Event streaming, high volume |
| `Transport.RMQ` | Complex routing, reliable delivery |
| `Transport.GRPC` | Cross-language, schema-first |

---

## Gateway — API & WebSocket Gateways

### `gateway api` — API Gateway pattern

```typescript
// API Gateway aggregates multiple microservices
@Module({
  imports: [
    ClientsModule.register([
      { name: 'USER_SERVICE', transport: Transport.REDIS, options: { host: 'localhost', port: 6379 } },
      { name: 'ORDER_SERVICE', transport: Transport.REDIS, options: { host: 'localhost', port: 6379 } },
    ]),
  ],
})
export class GatewayModule {}
```

### `gateway websocket` — WebSocket gateway

```typescript
import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody, ConnectedSocket } from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway {
  @WebSocketServer()
  server: Server

  @SubscribeMessage('message')
  handleMessage(@MessageBody() data: { room: string; text: string }, @ConnectedSocket() client: Socket) {
    this.server.to(data.room).emit('message', { text: data.text, userId: client.id })
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`)
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`)
  }
}
```

---

## Test — Testing

### `test` — Run all tests

```bash
npm run test           # Unit tests
npm run test:e2e       # E2E tests
npm run test:cov       # Coverage
```

### `test unit` — Unit test pattern

```typescript
// users.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { UsersService } from './users.service'
import { PrismaService } from '../../prisma/prisma.service'

describe('UsersService', () => {
  let service: UsersService
  let prisma: PrismaService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findMany: jest.fn(),
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
              count: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile()

    service = module.get<UsersService>(UsersService)
    prisma = module.get<PrismaService>(PrismaService)
  })

  describe('findOne', () => {
    it('returns user when found', async () => {
      const mockUser = { id: '1', name: 'Test', email: 'test@test.com' }
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser as any)

      const result = await service.findOne('1')
      expect(result).toEqual(mockUser)
    })

    it('throws NotFoundException when not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null)
      await expect(service.findOne('999')).rejects.toThrow(NotFoundException)
    })
  })
})
```

### `test e2e` — E2E test pattern

```typescript
// test/users.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

describe('UsersController (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }))
    await app.init()
  })

  afterAll(async () => { await app.close() })

  it('GET /users returns 200', () => {
    return request(app.getHttpServer())
      .get('/users')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array)
      })
  })

  it('POST /users with invalid data returns 400', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({ name: '' })
      .expect(400)
  })
})
```

---

## Debug — Debugging

### `debug` — Run diagnostics

```bash
# Check NestJS version
npx nest info

# Check dependencies
npm ls @nestjs/core @nestjs/common @nestjs/platform-express
```

### Common Issues

| Issue | Solution |
|-------|----------|
| Circular dependency | Use `forwardRef()` |
| Provider not found | Check module imports/exports |
| Guard not applied | Check `@UseGuards()` order |
| Validation not working | Add `ValidationPipe` globally |
| CORS error | Enable `app.enableCors()` |
| Microservice not connecting | Check transport config |
| Queue not processing | Check Redis connection, processor registered |
| WebSocket not connecting | Check CORS, gateway decorator |

### `debug swagger` — Swagger setup

```typescript
// main.ts
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'

const config = new DocumentBuilder()
  .setTitle('My API')
  .setVersion('1.0')
  .addBearerAuth()
  .build()

const document = SwaggerModule.createDocument(app, config)
SwaggerModule.setup('api/docs', app, document)
```

---

## Arguments

- `$ARGUMENTS` — Subcommand and action. Examples:
  - _(empty)_ — Show microservice overview
  - `init` / `init monorepo` / `init microservice` / `init hybrid`
  - `module <name>` / `module full <name>` / `module dynamic`
  - `service <name>` / `service prisma` / `service patterns`
  - `controller <name>`
  - `guard <name>` / `guard auth` / `guard roles`
  - `pipe <name>`
  - `queue` / `queue bull` / `queue events` / `queue microservice`
  - `gateway api` / `gateway websocket`
  - `test` / `test unit` / `test e2e`
  - `debug` / `debug swagger`

## Output

Microservice development with NestJS across modules, services, controllers, guards, queues, gateways, testing, and debugging.
