import { async, getTestBed, inject, TestBed } from '@angular/core/testing';
import { BaseRequestOptions, Http, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { cloneDeep } from 'lodash';

import { AuthenticationService, UserService, AUTH_API_URL, User } from 'ngx-login-client';
import { Broadcaster, Logger } from 'ngx-base';

import { WIT_API_URL } from '../api/wit-api';
import { Space } from '../models/space';
import { SpaceService } from './space.service';
import { Observable } from 'rxjs/Observable';

describe('Service: SpaceService', () => {

  let spaceService: SpaceService;
  let mockService: MockBackend;
  let fakeAuthService: any;
  let fakeUserService: any;
  let mockLog: any;

  beforeEach(() => {
    mockLog = jasmine.createSpyObj('Logger', ['error']);
    fakeAuthService = {
      getToken: function () {
        return '';
      },
      isLoggedIn: function () {
        return true;
      }
    };
    fakeUserService = {
      getUserByUserId: function(userId: string) {
        return Observable.empty<User>();
      }
    };
    TestBed.configureTestingModule({
      providers: [
        {
          provide: Logger, useValue: mockLog
        },
        BaseRequestOptions,
        MockBackend,
        {
          provide: Http,
          useFactory: (backend: MockBackend,
            options: BaseRequestOptions) => new Http(backend, options),
          deps: [MockBackend, BaseRequestOptions]
        },
        {
          provide: AuthenticationService,
          useValue: fakeAuthService
        },
        {
          provide: UserService,
          useValue: fakeUserService
        },
        SpaceService,
        {
          provide: WIT_API_URL,
          useValue: 'http://example.com/'
        },
        {
          provide: AUTH_API_URL,
          useValue: 'http://example.com/auth'
        },
        Broadcaster
      ]
    }).compileComponents().then(() => {
      //spaceService = TestBed.get(SpaceService);

    });
  });

  beforeEach(inject(
    [SpaceService, MockBackend],
    (service: SpaceService, mock: MockBackend) => {
      spaceService = service;
      mockService = mock;
    }
  ));

  let responseData: Space[] = [
    {
      name: 'TestSpace',
      path: 'testspace',
      teams: [],
      defaultTeam: null,
      'attributes': {
        'name': 'TestSpace',
        description: 'This is a space for unit test',
        'created-at': null,
        'updated-at': null,
        'version': 0
      },
      'id': '1',
      'type': 'spaces',
      'links': {
        'self': 'http://example.com/api/spaces/1'
      },
      'relationships': {
        areas: {
          links: {
            related: 'http://example.com/api/spaces/1/areas'
          }
        },
        iterations: {
          links: {
            related: 'http://example.com/api/spaces/1/iterations'
          }
        },
        workitemtypegroups: {
          links: {
            related: 'http://example.com/api/spacetemplates/1/workitemtypegroups'
          }
        },
        // collaborators: {
        //   links: {
        //     related: 'http://example.com/api/spaces/1/iterations'
        //   }
        // },
        'owned-by': {
          'data': {
            'id': '00000000-0000-0000-0000-000000000000',
            'type': 'identities'
          }
        }
      }
    }
  ];
  let response = { data: responseData, links: {} };
  let expectedResponse = cloneDeep(responseData);

  // for odd characters
  let responseDataWithSlash: Space[] = [
    {
      name: 'Test/Space',
      path: 'test/space',
      teams: [],
      defaultTeam: null,
      'attributes': {
        'name': 'Test/Space',
        description: 'This is a space for unit test',
        'created-at': null,
        'updated-at': null,
        'version': 0
      },
      'id': '1',
      'type': 'spaces',
      'links': {
        'self': 'http://example.com/api/spaces/1'
      },
      'relationships': {
        areas: {
          links: {
            related: 'http://example.com/api/spaces/1/areas'
          }
        },
        iterations: {
          links: {
            related: 'http://example.com/api/spaces/1/iterations'
          }
        },
        workitemtypegroups: {
          links: {
            related: 'http://example.com/api/spacetemplates/1/workitemtypegroups'
          }
        },
        // collaborators: {
        //   links: {
        //     related: 'http://example.com/api/spaces/1/iterations'
        //   }
        // },
        'owned-by': {
          'data': {
            'id': '00000000-0000-0000-0000-000000000000',
            'type': 'identities'
          }
        }
      }
    }
  ];


  it('Get spaces', (() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })
      ));
    });
    // when
    spaceService.getSpaces().subscribe((data: Space[]) => {
      // then
      expect(data[0].id).toEqual(expectedResponse[0].id);
      expect(data[0].attributes.name).toEqual(expectedResponse[0].attributes.name);
      expect(data[0].attributes.description).toEqual(expectedResponse[0].attributes.description);
    });
  }));

  it('Add new space', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: responseData[0]}),
          status: 201
        })
      ));
    });
    // when
    spaceService.create(responseData[0])
      .subscribe((data: Space) => {
        // then
        expect(data.id).toEqual(expectedResponse[0].id);
        expect(data.attributes.name).toEqual(expectedResponse[0].attributes.name);
        expect(data.attributes.description).toEqual(expectedResponse[0].attributes.description);
      });
  }));

  it('Add new space in error', async(() => {
    // given
    mockLog.error.and.returnValue();
    mockService.connections.subscribe((connection: any) => {
      connection.mockError(new Error('some error'));
    });
    // when
    spaceService.create(responseData[0])
      .subscribe((data: Space) => {
        fail('Add new space should be in error');
      }, // then
      error => expect(error).toEqual('some error'));
  }));

  it('Update a space', async(() => {
    // given
    let updatedData: Space = cloneDeep(responseData[0]);
    updatedData.attributes.description = 'Updated description';
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: updatedData}),
          status: 200
        })
      ));
    });
    // when
    spaceService.update(updatedData)
      .subscribe((data: Space) => {
        // then
        expect(data.id).toEqual(updatedData.id);
        expect(data.attributes.name).toEqual(updatedData.attributes.name);
        expect(data.attributes.description).toEqual(updatedData.attributes.description);
      });
  }));

  it('Update a space in error', async(() => {
    // given
    let updatedData: Space = cloneDeep(responseData[0]);
    mockLog.error.and.returnValue();
    mockService.connections.subscribe((connection: any) => {
      connection.mockError(new Error('some error'));
    });
    // when
    spaceService.update(updatedData)
      .subscribe((data: Space) => {
        fail('Update a space should be in error');
      }, // then
      error => expect(error).toEqual('some error'));
  }));

  it('Get a single space', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: responseData[0]}),
          status: 200
        })
      ));
    });
    let userName = 'testuser';
    // when
    spaceService.getSpaceByName(userName, responseData[0].attributes.name)
      .subscribe((data: Space) => {
        // then
        expect(data.id).toEqual(expectedResponse[0].id);
        expect(data.attributes.name).toEqual(expectedResponse[0].attributes.name);
        expect(data.attributes.description).toEqual(expectedResponse[0].attributes.description);
      });
  }));


  it('Get a single space with plus, space and slash character', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      expect(connection.request.url)
          .toMatch(/.*test\%2Bus%20er.*/, 'url username not properly encoded');
      expect(connection.request.url)
          .toMatch(/.*Test\%2FSpace.*/, 'url spacename not properly encoded');
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: responseDataWithSlash[0]}),
          status: 200
        })
      ));
    });
    let userName = 'test+us er';
    // when
    spaceService.getSpaceByName(userName, responseDataWithSlash[0].attributes.name)
      .subscribe((data: Space) => {
        // then
        expect(data.id).toEqual(expectedResponse[0].id);
        expect(data.attributes.description).toEqual(expectedResponse[0].attributes.description);
      });
  }));


  it('Get a single space in error', async(() => {
    // given
    mockLog.error.and.returnValue();
    mockService.connections.subscribe((connection: any) => {
      connection.mockError(new Error('some error'));
    });
    let userName = 'testuser';
    // when
    spaceService.getSpaceByName(userName, responseData[0].attributes.name)
      .subscribe((data: Space) => {
        fail('Get a single space should be in error');
      }, // then
      error => expect(error).toEqual('some error'));
  }));

  it('Search a space by name', async(() => {
    let matchedData: Space[] = cloneDeep(responseData);

    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })
      ));
    });

    spaceService.search('test')
      .subscribe((data: Space[]) => {
        expect(data[0].id).toEqual(matchedData[0].id);
        expect(data[0].attributes.name).toEqual(matchedData[0].attributes.name);
        expect(data[0].attributes.description).toEqual(matchedData[0].attributes.description);
      });
  }));

  it('Search a space by name in error', async(() => {
    // given
    let matchedData: Space[] = cloneDeep(responseData);
    mockLog.error.and.returnValue();
    mockService.connections.subscribe((connection: any) => {
      connection.mockError(new Error('some error'));
    });
    // when
    spaceService.search('test')
      .subscribe((data: Space[]) => {
        fail('Search a space by name should be in error');
      }, // then
      error => expect(error).toEqual('some error'));
  }));

  it('Get spaces by userName', async(() => {
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })
      ));
    });

    let userName = 'testUser';

    spaceService.getSpacesByUser(userName).subscribe((data: Space[]) => {
      expect(data[0].id).toEqual(expectedResponse[0].id);
      expect(data[0].attributes.name).toEqual(expectedResponse[0].attributes.name);
      expect(data[0].attributes.description).toEqual(expectedResponse[0].attributes.description);
    });
  }));

  it('Get spaces by userName including plus', async(() => {
    mockService.connections.subscribe((connection: any) => {
      expect(connection.request.url).toMatch(/.*test\%2BUser.*/, 'url not properly encoded');
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })
      ));
    });

    let userName = 'test+User';

    spaceService.getSpacesByUser(userName).subscribe((data: Space[]) => {
      expect(data[0].id).toEqual(expectedResponse[0].id);
      expect(data[0].attributes.name).toEqual(expectedResponse[0].attributes.name);
      expect(data[0].attributes.description).toEqual(expectedResponse[0].attributes.description);
    });
  }));

  it('Get spaces by userName in error', async(() => {
    // given
    let matchedData: Space[] = cloneDeep(responseData);
    mockLog.error.and.returnValue();
    mockService.connections.subscribe((connection: any) => {
      connection.mockError(new Error('some error'));
    });
    let userName = 'testUser';
    // when
    spaceService.getSpacesByUser(userName).subscribe((data: Space[]) => {
      fail('Get spaces by userName should be in error');
    }, // then
    error => expect(error).toEqual('some error'));
  }));

  it('Get a single space by Id', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify({data: responseData[0]}),
          status: 200
        })
      ));
    });
    let spaceId = '1';
    // when
    spaceService.getSpaceById(spaceId)
      .subscribe((data: Space) => {
        // then
        expect(data.id).toEqual(expectedResponse[0].id);
        expect(data.attributes.name).toEqual(expectedResponse[0].attributes.name);
        expect(data.attributes.description).toEqual(expectedResponse[0].attributes.description);
      });
  }));

  it('Get a single space by Id in error', async(() => {
    // given
    mockService.connections.subscribe((connection: any) => {
      connection.mockError(new Error('some error'));
    });
    let spaceId = '1';
    // when
    spaceService.getSpaceById(spaceId)
      .subscribe((data: Space) => {
        fail('Get a single space by Id should be in error');
      }, // then
    error => expect(error).toEqual('some error'));
  }));

});
