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
import {
  VersionedDoc, DocId, DocRef, DocRevs, DocIdRange, RevStatusDoc, ReadOpts
} from 'cbox-vault'

export interface AccountFactoryBuilder {
  (isValidPassphrase: (passphrase: string) => Promise<boolean>,
  opts?: Partial<AccountFactorySpec>): AccountFactory
}

export interface AccountFactorySpec {
  // void
}

/**
 * create an [Account]{@link Account} instance
 * for a new [AccountDoc]{@link AccountDoc}.
 * the `_rev` property of the returned [Account]{@link Account} instance
 * is forced to `undefined`.
 */
export interface AccountFactory {
  (doc: AccountDoc): Account
}

export interface AccountDoc extends DocId { // no _rev property
  name: string
  url: string
  username: string
  password: string
  keywords: string[]
  comments: string
  /**
   * automatic login
   * default: false
   */
  login?: boolean
  /**
   * enables passphrase-protected access to the `password` property.
   * default: true
   */
  restricted?: boolean
}

export interface Account extends VersionedDoc {
  /**
   * create a new [AccoutDoc]{@link AccountDoc} instance
   * from this [AccoutDoc]{@link AccountDoc}
   * with updated entries from the given `props` object.
   *
   * @error {Error} 'invalid passphrase'
   * when `props` includes updated `password` or `restricted` entries,
   * and `restricted` is true, and `passphrase` is invalid.
   */
  set (props: Partial<AccountDoc>, passphrase?: string): Promise<Account>
  readonly _id: string
  readonly _rev: string
  readonly name: string
  readonly url: string
  readonly username: string
  /**
   * return the password string.
   *
   * @error {Error} 'invalid passphrase'
   * when `restricted` is `true` and `passphrase` is invalid.
   */
  password (passphrase?: string): Promise<string>
  readonly keywords: string[]
  readonly comments: string
  readonly login: boolean
  readonly restricted: boolean
}
