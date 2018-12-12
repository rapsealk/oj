const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const data = require('./data.json');
const __submission = path.join(__dirname, "../submits");

const runway = {
	"1": (socket, { pid, studentNumber }) => {

		let stdout = '';
		
		try {
			// Run
			const executable = `${pid}.exe`;
			const executionArgs = [];
			const executionOptions = { cwd: path.join(__submission, `${studentNumber}`) };
			const executionProcess = spawn(executable, executionArgs, executionOptions);
			executionProcess.stdin.setDefaultEncoding('utf-8');
			//executionProcess.stdout.setDefaultEncoding('utf-8');
			executionProcess.stderr.setDefaultEncoding('utf-8');
			const outputs = data[`${pid}`].output.slice(0);
			executionProcess.stdout.on('data', dum => {
				// const output = dum.toString('utf-8').replace(/\s+$/, "");	// rtrim
				// console.log('[Execution::STDOUT]:', output);
				stdout += dum.toString('utf-8');
			});
			executionProcess.stderr.on('data', data => console.log('[Execution::STDERR]:', data.toString('utf-8')));
			executionProcess.on('error', message => console.log('[Execution::ERROR]:', message));
			executionProcess.on('close', code => {
				console.log('[Execution::CLOSE]:', code);
				fs.unlink(`${__submission}/${studentNumber}/${pid}.exe`, console.error);

				socket.emit('correct', 'Hello world!');
				// CRLF
				stdout = stdout.split('\r\n').map(od => od.replace(/\s+$/, ""));
				stdout.pop();
				// socket.emit('correct', `result: ${(stdout.join(' ') === outputs.join(' '))}`);
				const condition = (stdout.join(' ') === outputs.join(' '));
			});
		}
		catch (error) {
			// throw error;
			socket.emit('exerror', error.code);
		}
	},
	"2": (socket, { pid, studnetNumber }) => {
		const executable = `${pid}.exe`;
			const executionArgs = [];
			const executionOptions = { cwd: path.join(__submission, `${studentNumber}`) };
			const executionProcess = spawn(executable, executionArgs, executionOptions);
			executionProcess.stdout.on('data', data => console.log('[Execution::STDOUT]:', data.toString('utf-8')));
			executionProcess.stderr.on('data', data => console.log('[Execution::STDERR]:', data.toString('utf-8')));
			executionProcess.on('error', message => console.log('[Execution::ERROR]:', message));
			executionProcess.on('close', code => {
				console.log('[Execution::CLOSE]:', code);
				fs.unlink(`${__submission}/${studentNumber}/${pid}.exe`, console.error);

				socket.emit('correct', 'Hello world!');
			});
	}
};

module.exports = io => {

	io.on('connection', socket => {
		console.log('socket connected!');

		socket.on('data', data => {

			const { pid, studentNumber, code } = data;
			let cflag = true;

			console.log('pid:', pid);
			console.log('studentNumber:', studentNumber);
			console.log('=========== code ===========');
			console.log(code + '\n');

			const codename = `${__submission}\\${studentNumber}\\${pid}.c`;
			fs.writeFileSync(codename, code, 'utf-8');
			console.log('codename:', codename);

			try {
				// Compile
				const compileArgs = [`${pid}.c`];
				const compileOptions = { cwd: path.join(__submission, `${studentNumber}`) };
				const compileProcess = spawn('cl', compileArgs, compileOptions);
				compileProcess.stdout.on('data', data => console.log('[Compile::STDOUT]:', data.toString('utf-8')));
				compileProcess.stderr.on('data', data => {
					console.log('[Compile::STDERR]:', data.toString('utf-8'));
					// cflag = false;
				});
				compileProcess.on('error', message => {
					console.log('[Compile::ERROR]:', message);
					cflag = false;
				});
				compileProcess.on('close', code => {
					console.log('[Compile::CLOSE]:', code);
					fs.unlink(`${__submission}/${studentNumber}/${pid}.obj`, console.error);

					if (cflag) runway[`${pid}`](socket, { pid, studentNumber });
				});
			}
			catch (error) {
				console.log('[Compile::Error]:', error);
			}
		});

		socket.on('disconnect', () => {
			console.log('socket disconnected!');
		});
	});
};
