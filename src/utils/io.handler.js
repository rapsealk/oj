const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const __submission = path.join(__dirname, "../submission");

module.exports = io => {

	io.on('connection', socket => {
		console.log('socket connected!');

		socket.on('data', data => {

			const { pid, studentNumber, code } = data;

			console.log('pid:', pid);
			console.log('studentNumber:', studentNumber);
			console.log('=========== code ===========');
			console.log(code + '\n');

			/*
			// Check if directory "submission" already exists.
			const __submission = path.join(__dirname, "../submission");
			try {
				fs.statSync(__submission);
			} catch (e) {
				if (e.code === "ENOENT") fs.mkdirSync(__submission);
			}

			// Check if directory name of student number.
			const __sdir = path.join(__submission, `${studentNumber}`);
			try {
				fs.statSync(__sdir);
			} catch (e) {
				if (e.code === "ENOENT") fs.mkdirSync(__sdir);
			}
			*/

			const codename = `${__submission}\\${studentNumber}\\${pid}.c`;
			fs.writeFileSync(codename, code, 'utf-8');
			console.log('codename:', codename);

			try {
				// Compile
				const compileArgs = [`${pid}.c`];
				const compileOptions = { cwd: path.join(__dirname, `../submission/${studentNumber}`) };
				const compileProcess = spawn('cl', compileArgs, compileOptions);
				compileProcess.stdout.on('data', data => console.log('[Compile::STDOUT]:', data.toString('utf-8')));
				compileProcess.stderr.on('data', data => console.log('[Compile::STDERR]:', data.toString('utf-8')));
				compileProcess.on('error', message => console.log('[Compile::ERROR]:', message));
				compileProcess.on('close', code => {
					console.log('[Compile::CLOSE]:', code);
					fs.unlink(`${__submission}/${studentNumber}/${pid}.obj`, console.error);

					try {
						// Run
						const executable = `${pid}.exe`;
						const executionArgs = [];
						const executionOptions = { cwd: path.join(__dirname, `../submission/${studentNumber}`) };
						const executionProcess = spawn(executable, executionArgs, executionOptions);
						executionProcess.stdout.on('data', data => console.log('[Execution::STDOUT]:', data.toString('utf-8')));
						executionProcess.stderr.on('data', data => console.log('[Execution::STDERR]:', data.toString('utf-8')));
						executionProcess.on('error', message => console.log('[Execution::ERROR]:', message));
						executionProcess.on('close', code => {
							console.log('[Execution::CLOSE]:', code);
							fs.unlink(`${__submission}/${studentNumber}/${pid}.exe`, console.error);
						});
					}
					catch (error) {
						throw error;
					}
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
