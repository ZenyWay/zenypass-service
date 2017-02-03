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
import { OpgpService, OpgpProxyKey } from 'opgp-service'
import {
  VersionedDoc, DocId, DocRef, DocRevs, DocIdRange, RevStatusDoc, ReadOpts
} from 'cbox-vault'
import { AccountFactory, Account, AccountDoc } from '../account'
export interface Observable<T> {} // TODO: replace with import

export { AccountFactory, Account, AccountDoc }

export interface ZenypassVaultServiceFactory {
  (config: ZenypassVaultServiceConfig): Promise<ZenypassVaultServiceFactory>
}

export interface ZenypassVaultServiceConfig {
  /**
   * unlocked private user-agent key,
   * required for decrypting the SDBK.
   *
   * @type {OpgpProxyKey}
   * @memberOf ZenypassVaultServiceConfig
   * @see ZenypassVaultServiceConfig#OpgpService
   */
  suak: OpgpProxyKey
  /**
   * either `agents` or `dbs/${dbid}`,
   * where `dbid` is the identification string
   * of the user database at `/users/${uuid}/dbs/${uuid}`
   * on the backend server.
   *
   * @type {string}
   * @memberOf ZenypassVaultServiceConfig
   */
  dbid: string
  /**
   * @type {string}
   * @memberOf ZenypassVaultServiceConfig
   */
  uuid: string
  /**
   * common root of database names:
   * * `${rootpath}/${uuid}` for key management
   * * `${rootpath}/${uuid}/${dbid}` for the vault
   *
   * @type {string=user}
   * @memberOf VaultServiceConfig
   */
  rootpath: string
  /**
   * @type {OpgpService}
   * @memberOf ZenypassVaultServiceConfig
   */
  opgpService: OpgpService
}

export interface ZenypassVaultService {
  newAccount: AccountFactory
  /**
   * @public
   * @method
   *
   * @description
   * rx operator that stores the documents from an input sequence to
   * the underlying (cbox-vault)[https://www.npmjs.com/package/cbox-vault] instance,
   * and maps that input sequence to a corresponding sequence of
   * resulting {DocRef} references.
   *
   * @param {Observable<ZenypassDoc[]|ZenypassDoc>} doc$
   * a sequence of instances or arrays of {ZenypassDoc} versioned documents.
   *
   * @return {Observable<DocRef[]|DocRef>}
   * sequence of resulting {DocRef} references after storage.
   * when the input `doc$` sequence emits an array of documents,
   * the output sequence emits a resulting array of {DocRef} references,
   * in the same order.
   *
   * @error {Error} when storing a document fails,
   * e.g. when the underlying key is locked.
   * // TODO provide more detail on possible storage errors
   *
   * @memberOf ZenypassVaultService
   */
  write (doc$: Observable<Account[]|Account>): Observable<DocRef[]|DocRef>

  /**
   * @public
   * @method
   *
   * @description
   * rx operator that maps a sequence of document references
   * to the corresponding documents fetched from
   * the underlying (cbox-vault)[https://www.npmjs.com/package/cbox-vault] instance.
   * the input document reference sequence may alternatively emit
   * any of the following:
   * * individual {DocRef} or {DocId} references,
   * * arrays of {DocRef} or {DocId} references,
   * * {DocIdRange} ranges of document references,
   * * {DocRevs} sets of references to document revisions.
   *
   * @param {Observable<DocRef[]|DocIdRange|DocRevs|DocRef>} ref$
   * a sequence of document references.
   *
   * @return {Observable<ZenypassDoc[]|ZenypassDoc|(ZenypassDoc&DocRevStatus)>}
   * the referenced {ZenypassDoc} document(s)
   * with all of its content ~~excluding the `restricted` entry~~,
   * or only the corresponding {ZenypassDoc} stubbed references,
   * retrieved from the underlying
   * (cbox-vault)[https://www.npmjs.com/package/cbox-vault] instance.
   * when the input `refs` sequence emits
   * an array of {DocRef} or {DocId} references,
   * a {DocIdRange} range of document references,
   * or a {DocRevs} set of references to document revisions,
   * the output sequence emits a resulting array
   * of {ZenypassDoc} documents or {DocRef} references,
   * in the order of the input array of references,
   * or else as specified by the {DocIdRange} range.
   *
   * @error {Error} when retrieving a document fails
   * e.g. when the underlying key is locked.
   * // TODO provide more detail on possible fetch errors
   *
   * @memberOf ZenypassVaultService
   */
  read (ref$: Observable<DocRef[]|DocIdRange|DocRevs|DocRef>, opts?: ReadOpts):
  Observable<Account[]|Account|(Account&RevStatusDoc)>
}

export interface ZenypassCredentials {
  username: string
  passphrase: string
}
