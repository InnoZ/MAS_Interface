tmp_path = '/srv/MAS_Interface/tmp'

listen File.join(tmp_path, 'unicorn.sock'), backlog: 64
pid File.join(tmp_path, 'pids', 'unicorn.pid')

stderr_path '/srv/MAS_Interface/log/unicorn.log'
stdout_path '/srv/MAS_Interface/log/unicorn.log'

worker_processes 2
