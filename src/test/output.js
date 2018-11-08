const fs = require('fs');
const { spawn } = require('child_process');

const data = fs.readFileSync('./data.txt', { encoding: 'utf-8'}).split('\n');
data.pop();
const outputs = [];

const compile = spawn('gcc', ['a.c']);
compile.stdout.on('data', data => console.log('[compile:stdout]:', data.toString('utf-8')));
compile.stderr.on('data', data => console.log('[compile:stderr]:', data.toString('utf-8')));
compile.on('close', code => {
	console.log('[compile:close]:', code);

	const execute = spawn('./a.out');
	execute.stdout.on('data', data => {
		data = data.toString('utf-8');
		console.log('[execute:stdout]:', data);
		outputs.push(data);
	});
	execute.stderr.on('data', data => console.log('[execute:stderr]:', data.toString('utf-8')));
	execute.on('close', code => {
		console.log('[execute:close]:', code);

		fs.writeFileSync(`./${Date.now()}.txt`, outputs.join('\n'));
	});
	
	execute.stdin.setEncoding('utf-8');

	//data.forEach(execute.stdin.write);
	data.forEach(chunk => {
		console.log('chunk:', chunk);

		execute.stdin.write(chunk+'\n');
		// execute.stdin.end();
	});
	execute.stdin.end();
});
