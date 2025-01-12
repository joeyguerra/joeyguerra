import fs from 'node:fs'
import { FileRequestListener } from '../../../src/FileRequestListener.mjs'
export default async (server) =>  new FileRequestListener(server)