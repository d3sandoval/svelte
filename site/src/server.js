import polka from 'polka';
import send from '@polka/send';
import sirv from 'sirv';
import * as sapper from '@sapper/server';
import { sanitize_user, authenticate } from './utils/auth';

if (!process.env.PORT) {
	process.env.PORT = 3000;
}

const { PORT } = process.env;

const app = polka({
	onError: (err, req, res) => {
		const error = err.message || err;
		const code = err.code || err.status || 500;
		res.headersSent || send(res, code, { error }, {
			'content-type': 'text/plain'
		});
	}
});

if (process.env.PGHOST) {
	app.use(authenticate());
}

app.use(
	sirv('static', {
		dev: process.env.NODE_ENV === 'development',
		setHeaders(res) {
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.hasHeader('Cache-Control') || res.setHeader('Cache-Control', 'max-age=600'); // 10min default
		}
	}),

	sapper.middleware({
		session: req => ({
			user: sanitize_user(req.user)
		})
	})
);

app.listen(PORT);
