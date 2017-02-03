/*
 * Copyright 2016 Stephane M. Catala
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *  http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * Limitations under the License.
 */
;
// TODO interface for changing master password
import { ZenypassVaultService, ZenypassCredentials } from './vault-service'
export declare interface Observable<T> {} // TODO: replace with import

/**
 * @public
 * @function
 *
 * @description
 * sign-up for a new Zenypass account.
 *
 * @param {ZenypassCredentials} creds
 * the user should always be asked to enter the passphrase twice
 * for confirmation before calling this function.
 *
 * @param {ZenypassServiceOpts} [opts]
 *
 * @returns {Promise<ZenypassServiceFactory>}
 *
 * @error {Error} 'service unavailable'
 *
 * @error {Error} 'conflict'
 * when an account already exists for the given username
 *
 * @memberOf ZenypassServiceFactory
 */
export interface ZenypassAccountRequest {
  (creds: ZenypassCredentials, opts?: ZenypassServiceOpts):
  Promise<ZenypassServiceFactory>
}

/**
 * @public
 * @function
 *
 * @description
 * sign-in to an existing Zenypass account.
 *
 * @param {ZenypassCredentials} creds
 *
 * @param {ZenypassServiceOpts} [opts]
 *
 * @returns {Promise<AuthenticationService|ZenypassService>}
 * a Promise that resolves to either:
 * * a {AuthenticationService} instance
 * when this agent is not yet authorized access to the Zenypass account.
 * * a {ZenypassService} instance
 * when this agent is authorized access to the Zenypass account.
 *
 * @error {Error} 'service unavailable'
 *
 * @error {Error} 'authentication error'
 * when credentials do not match any existing Zenypass account.
 *
 * @memberOf ZenypassServiceFactory
 */
export interface ZenypassServiceFactory {
  (creds: ZenypassCredentials, opts?: ZenypassServiceOpts):
  Promise<AuthenticationService|ZenypassService>
}

export interface ZenypassServiceOpts {
  // TODO define options for the ZenypassService factory
  /**
   * @public
   * @property
   *
   * identification string of this local Agent.
   * default: TODO define default Agent identification string
   *
   * @type {string=}
   *
   * @memberOf ZenypassCredentials
   */
  id?: string
}

/**
 * @public
 * @interface
 *
 * @description
 * proxy to a {ZenypassWorker} instance
 * running in a dedicated {Worker} thread.
 * the {ZenypassWorker} is created by the factory
 * that returns this proxy instance
 * specfically for this proxy.
 *
 */
export interface ZenypassService {
  /**
   * @public
   * @method
   *
   * @description
   * revoke all agents and delete this Zenypass account.
   *
   * the user should be warned that this is irrevocable.
   *
   * @param {ZenypassCredentials} creds
   * necessary security, as it ensures
   * the account owner is requesting account deletion.
   *
   * @returns {Promise<ZenypassServiceFactoryRequest>}
   *
   * @memberOf ZenypassService
   */
  deleteAccount (creds: ZenypassCredentials): Promise<ZenypassAccountRequest>

  /**
   * @public
   * @method
   *
   * @description
   * signout from this Zenypass account.
   * terminate the dedicated {ZenypassWorker} instance.
   *
   * @returns {Promise<ZenypassServiceFactory>}
   *
   * @memberOf ZenypassService
   */
  signout (): Promise<ZenypassServiceFactory>

  /**
   * @public
   * @method
   *
   * @param {ZenypassCredentials} cred
   * necessary security, as it ensures
   * the account owner is requesting an authentication token.
   *
   * @returns {string}
   * new authentication token valid 15min.
   *
   * @memberOf ZenypassService
   */
  newAuthToken (cred: ZenypassCredentials): string

  /**
   * @public
   * @property
   *
   * @type {ZenypassVaultService}
   *
   * @memberOf ZenypassService
   */
  vault: ZenypassVaultService

  /**
   * @public
   * @property
   *
   * @type {Observable<(RemoteAgentManagementService)[]>}
   * @memberOf ZenypassService
   */
  agent$: Observable<(RevocationService)[]>

  /**
   * @public
   * @property
   *
   * @description
   * boolean stream that emits
   * * `true` when the agent running this ZenypassService goes online,
   * * `false` when the agent running this ZenypassService goes offline.
   *
   * @type {Observable<boolean>}
   *
   * @memberOf ZenypassService
   */
  online$: Observable<boolean>
}

/**
 * @public
 * @interface
 *
 * @description
 * authenticate or delete this local agent.
 * this interface is only available to a local agent
 * without access to its user's account,
 * i.e. before authorization or after revocation
 * by a remote authorized agent.
 */
export interface AuthenticationService extends AgentIdentifier {
  /**
   * @public
   * @method
   *
   * @description
   * authenticate a new agent with a secret string
   * recently generated by an authorized agent.
   *
   * @param {string} authToken
   * valid authentication token from an authorized agent.
   *
   * @returns {Promise<ZenypassService>}
   *
   * @error {Error} 'service unavailable'
   *
   * @error {Error} 'authentication failure'
   *
   * @memberOf AuthenticationService
   */
  authenticate (authToken: string): Promise<ZenypassService>

  /**
   * @public
   * @method
   *
   * @description
   * delete this local agent.
   *
   * since this method is only available to a local agent
   * without access to its user's account,
   * there is no risk of user 'lock-out',
   * i.e. deleting the last agent the user can access,
   * with the remaining agents not accessible to their user.
   *
   * @returns {Promise<void>}
   *
   * @error {Error} 'service unavailable'
   *
   * @memberOf AuthenticationService
   */
  delete (): Promise<void>
}

/**
 * @public
 * @interface
 *
 * @description
 * revoke remote agents.
 *
 * this interface is restricted to managing remote agents.
 *
 * @extends {AgentIdentifier}
 */
export interface RevocationService extends AgentIdentifier {
  /**
   * @public
   * @method
   *
   * @description
   * revoke access to this account for this Agent.
   *
   * calling this method enables deleting the corresponding agent
   * when next [signing-in to it]{@link AuthenticationService#delete}.
   *
   * @param {ZenypassCredentials} creds
   * necessary security, as it ensures
   * the account owner is issuing the revocation request.
   *
   * @returns {Promise<RevocationService[]}
   *
   * @memberOf RevocationService
   */
  revoke (creds: ZenypassCredentials): Promise<RevocationService[]>
}

export interface AgentIdentifier {
  /**
   * @public
   * @property
   *
   * an arbitrary identification string
   * helping the user recognize this Agent.
   * e.g. 'Android Chrome bbbc',
   * where `bbbc` could for example be a unique hash.
   *
   * @type {string}
   *
   * @see ZenypassServiceOpts#id
   *
   * @memberOf AgentIdentifier
   */
  id: string
}

class ServiceClass implements ZenypassService {
  static signup (this: void, creds: ZenypassCredentials, opts?: ZenypassServiceOpts):
  Promise<ZenypassServiceFactory> {
    return
  }

  static signin (this: void, creds: ZenypassCredentials, opts?: ZenypassServiceOpts):
  Promise<AuthenticationService|ZenypassService> {
    return
  }

  deleteAccount (creds: ZenypassCredentials): Promise<ZenypassAccountRequest> {
    return
  }

  signout (): Promise<ZenypassServiceFactory> {
    return
  }

  newAuthToken (cred: ZenypassCredentials): string {
    return
  }

  constructor (
    public vault: ZenypassVaultService,
    public agent$: Observable<(RevocationService)[]>,
    public online$: Observable<boolean>
  ) {}
}

export const signup: ZenypassAccountRequest = ServiceClass.signup
export const signin: ZenypassServiceFactory = ServiceClass.signin
