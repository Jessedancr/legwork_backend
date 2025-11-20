import createApp from '../src/app';
import connectMongo from '../src/core/configs/connectMongo';

let app: any = null;
let mongoConnected = false;

export default async function handler(req: any, res: any) {
  if (!mongoConnected) {
    const db = await connectMongo();
    app = createApp(db);
    mongoConnected = true;
  }
  
  return app(req, res);
}