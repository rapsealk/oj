const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// const database = require('./database');

const data = require('./data.json');
const __submission = path.join(__dirname, "../submits");
/*
async function updateResultOnDatabase(studentNumber, pid, condition) {
	try {
		var conn = await database.getConnection();
		const query = 'INSERT INTO record SET ?';
		const recordSet = {
			studentNumber, pid,
			result: condition,
			timestamp: new Date()
		};
		const queryId = await conn.query(query, recordSet);
		console.log('queryId:', queryId);
	}
	catch (error) {
		console.error(error);
	}
	finally {
		await database.releaseConnection(conn);
	}
}
*/
const runway = {
	"1": (socket, { pid, studentNumber }) => {

		let stdout = '';
		
		try {
			// Run
			const executable = `${pid}.exe`;
			const executionArgs = [];
			const executionOptions = { cwd: path.join(__submission, `${studentNumber}`) };
			const executionProcess = spawn(executable, executionArgs, executionOptions);
			let processIsRunning = true;
			executionProcess.stdin.setDefaultEncoding('utf-8');
			executionProcess.stdout.setDefaultEncoding('utf-8');
			executionProcess.stderr.setDefaultEncoding('utf-8');
			const outputs = data[`${pid}`].output.slice(0);
			executionProcess.stdout.on('data', dum => stdout += dum.toString('utf-8'));
			executionProcess.stderr.on('data', data => console.log('[Execution::STDERR]:', data.toString('utf-8')));
			executionProcess.on('error', message => console.log('[Execution::ERROR]:', message));
			executionProcess.on('close', async code => {
				if (!processIsRunning) return;
				processIsRunning = false;
				console.log('[Execution::CLOSE]:', code);
				//fs.unlink(`${__submission}/${studentNumber}/${pid}.exe`, console.error);

				// CRLF
				stdout = stdout.split('\r\n').map(od => od.replace(/\s+$/, ""));
				stdout.pop();

				const condition = (stdout.join(' ') === outputs.join(' '));

				// await updateResultOnDatabase(studentNumber, pid, condition);

				if (condition)
					socket.emit('correct', '맞았습니다.');
				else
					socket.emit('exerror', '틀렸습니다.');
			});

			setTimeout(() => {
				if (!processIsRunning) return;
				processIsRunning = false;
				executionProcess.kill('SIGKILL');
				socket.emit('exerror', '시간 초과되었습니다.');
			}, 3000);
		}
		catch (error) {
			// throw error;
			socket.emit('exerror', error.code);
		}
	},
	"2": (socket, { pid, studentNumber }) => {

		const raw_inputs = data[`${pid}`].input.slice(0);
		const outputs = data[`${pid}`].output.slice(0);

		const inputs = [];
		for (let i = 0; i < raw_inputs.length; i += 2) {
			inputs.push([raw_inputs[i], raw_inputs[i+1]]);
		}

		const result = outputs.map(o => false);
		const caseCount = inputs.length;
		let closeCount = 0;

		inputs.forEach((input, idx) => {
			try {
				const executable = `${pid}.exe`;
				const executionArgs = [];
				const executionOptions = { cwd: path.join(__submission, `${studentNumber}`) };
				const executionProcess = spawn(executable, executionArgs, executionOptions);
				executionProcess.stdin.setDefaultEncoding('utf-8');
				executionProcess.stdout.setDefaultEncoding('utf-8');
				executionProcess.stderr.setDefaultEncoding('utf-8');
				executionProcess.stdout.on('data', data => {
					data = data.toString('utf-8').replace('\r\n', '');
					console.log('[Execution::STDOUT]:', data);

					result[idx] = (data == outputs[idx]);
				});
				executionProcess.stderr.on('data', data => console.log('[Execution::STDERR]:', data.toString('utf-8')));
				executionProcess.on('error', message => console.log('[Execution::ERROR]:', message));
				executionProcess.on('close', async code => {
					console.log('[Execution::CLOSE]:', code);
					
					closeCount += 1;
					if (closeCount == caseCount) {

						const condition = (result.filter(r => r == true).length == result.length);
						// await updateResultOnDatabase(studentNumber, pid, condition);

						if (condition)
							socket.emit('correct', '맞았습니다.');
						else
							socket.emit('exerror', '틀렸습니다.');
						//fs.unlink(`${__submission}/${studentNumber}/${pid}.exe`, console.error);
					}
				});

				executionProcess.stdin.write(input[0] + '\n');
				executionProcess.stdin.write(input[1] + '\n');
				executionProcess.stdin.end();
			}
			catch (error) {
				socket.emit('exerror', error.code);
			}
		});
	},
	// FIXME: Windows Defender 실시간 검사에서 문제 발생
	"3": (socket, { pid, studentNumber }) => {

		const cases = data[`${pid}`];
		const result = cases.map(c => false);
		let closeCount = 0;

		cases.forEach((_case, index) => {
			try {
				const executable = `${pid}.exe`;
				const executionArgs = [];
				const executionOptions = { cwd: path.join(__submission, `${studentNumber}`) };
				const executionProcess = spawn(executable, executionArgs, executionOptions);
				executionProcess.stdin.setDefaultEncoding('utf-8');
				executionProcess.stdout.setDefaultEncoding('utf-8');
				executionProcess.stderr.setDefaultEncoding('utf-8');
				executionProcess.stdout.on('data', data => {
					data = data.toString('utf-8').split('\r\n').map(it => it.replace(/\s+$/, ''));
					data.pop();
					let succeed = true;
					for (let i = 0; i < data.length; i++) {
						console.log([data[i], _case.output[i]]);
						console.log('matches:', data[i] == _case.output[i]);
						succeed &= (data[i] == _case.output[i]);
					}
					result[index] = succeed;
				});
				executionProcess.stderr.on('data', data => console.log('[Execution::STDERR]:', data.toString('utf-8')));
				executionProcess.on('error', message => console.log('[Execution::ERROR]:', message));
				executionProcess.on('close', async code => {
					console.log('[Execution::CLOSE]:', code);

					closeCount += 1;
					if (closeCount == cases.length) {

						const condition = (result.length == result.filter(r => r).length);

						//await updateResultOnDatabase(studentNumber, pid, condition);
						// fs.unlink(`${__submission}/${studentNumber}/${pid}.exe`, console.error);

						if (condition)
							socket.emit('correct', '맞았습니다.');
						else
							socket.emit('exerror', '틀렸습니다');
					}
				});

				executionProcess.stdin.write(_case.input + '\n');
				executionProcess.stdin.end();
			}
			catch (error) {
				console.error(error);
				socket.emit('exerror', error.message);
			}
		});
	},
	"4": (socket, { pid, studentNumber }) => {
		
		const dataset = data[`${pid}`];
		const result = dataset.map(d => false);
		let closeCount = 0;

		dataset.forEach((dset, index) => {
			const executable = `${pid}.exe`;
			const executionArgs = [];
			const executionOptions = { cwd: path.join(__submission, `${studentNumber}`) };
			const executionProcess = spawn(executable, executionArgs, executionOptions);
			executionProcess.stdin.setDefaultEncoding('utf-8');
			executionProcess.stdout.setDefaultEncoding('utf-8');
			executionProcess.stderr.setDefaultEncoding('utf-8');
			executionProcess.stdout.on('data', data => {
				data = data.toString('utf-8').split('\r\n');
				data.pop();
				console.log('[Execution::STDOUT]:', data);
				result[index] = (dset.output.join('') == data.join(''));
			});
			executionProcess.stderr.on('data', data => console.log('[Execution::STDERR]:', data.toString('utf-8')));
			executionProcess.on('error', message => console.log('[Execution::ERROR]:', message));
			executionProcess.on('close', async code => {
				console.log('[Execution::CLOSE]:', code);

				closeCount += 1;

				if (closeCount == result.length) {
					//fs.unlink(`${__submission}/${studentNumber}/${pid}.exe`, console.error);

					const condition = (result.length == result.filter(r => r).length);
					//await updateResultOnDatabase(studentNumber, pid, condition);

					if (condition)
							socket.emit('correct', '맞았습니다.');
						else
							socket.emit('exerror', '틀렸습니다');
				}
			});

			dset.input.forEach(di => executionProcess.stdin.write(di + '\n'));
			executionProcess.stdin.end();
		});
	},
	"5": (socket, { pid, studentNumber }) => {
		const executable = `${pid}.exe`;
		const executionArgs = [];
		const executionOptions = { cwd: path.join(__submission, `${studentNumber}`) };
		const executionProcess = spawn(executable, executionArgs, executionOptions);
		executionProcess.stdin.setDefaultEncoding('utf-8');
		executionProcess.stdout.setDefaultEncoding('utf-8');
		executionProcess.stderr.setDefaultEncoding('utf-8');
		let stdoutCount = 0;
		executionProcess.stdout.on('data', data => {
			console.log('[Execution::STDOUT]:', data.toString('utf-8'));
			stdoutCount += 1;
			if (stdoutCount == 10) executionProcess.kill('SIGHUP');
		});
		executionProcess.stderr.on('data', data => console.log('[Execution::STDERR]:', data.toString('utf-8')));
		executionProcess.on('error', message => console.log('[Execution::ERROR]:', message));
		executionProcess.on('close', async code => {
			console.log('[Execution::CLOSE]:', code);
			fs.unlink(`${__submission}/${studentNumber}/${pid}.exe`, console.error);

			socket.emit('correct', 'Hello world!');
		});

		data[`${pid}`].input.forEach(number => executionProcess.stdin.write(number + '\n'));
		executionProcess.stdin.end();
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

			if (pid == '4' || pid == '5') {
				socket.emit('correct', '제출이 완료되었습니다.');
				return;
			}

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
					//fs.unlink(`${__submission}/${studentNumber}/${pid}.obj`, console.error);

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
