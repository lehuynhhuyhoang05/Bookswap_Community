import { Test, TestingModule } from '@nestjs/testing';
import { MessagesGateway } from './messages.gateway';
import { JwtService } from '@nestjs/jwt';
import { MessagesService } from '../../services/messages.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Member } from '../../../../infrastructure/database/entities/member.entity';

describe('MessagesGateway', () => {
  let gateway: MessagesGateway;
  let jwtService: JwtService;
  let messagesService: MessagesService;

  const mockJwtService = {
    verify: jest.fn(),
    sign: jest.fn(),
  };

  const mockMessagesService = {
    createMessage: jest.fn(),
    getConversationMessages: jest.fn(),
    markAsRead: jest.fn(),
  };

  const mockMemberRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesGateway,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MessagesService,
          useValue: mockMessagesService,
        },
        {
          provide: getRepositoryToken(Member),
          useValue: mockMemberRepository,
        },
      ],
    }).compile();

    gateway = module.get<MessagesGateway>(MessagesGateway);
    jwtService = module.get<JwtService>(JwtService);
    messagesService = module.get<MessagesService>(MessagesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  it('should have JwtService injected', () => {
    expect(jwtService).toBeDefined();
  });

  it('should have MessagesService injected', () => {
    expect(messagesService).toBeDefined();
  });
});
