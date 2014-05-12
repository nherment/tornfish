
Data types
==========

- server
- key
- config
- image


Usage
=====

    tornfish <action> <type> [options]

Available actions are:

- add
- list
- set
- status
- containers
- images
- deploy
- undeploy

examples
--------


    tornfish list server|key|config|image

    # use --view to filter visible columns
    tornfish list server --view name --view host

config
------

    tornfish add config <name> --value <value>


server
------

    tornfish add server <name> [--host <hostname|ip>] [--port <ssh_port>] [--user <username>] [--key <sshKeyName>] [--password <password>]

    tornfish set server <name> [--key <key_name>] ...

    tornfish status server <name1> <name2>

    tornfish deploy <server> --image <image> --port <from_1>:<to_1> --port <from_2>:<to_2>
    tornfish undeploy <server> --container <container>

key
---

tornfish can store ssh keys and use them to connect to the servers

    tornfish list key

    tornfish add key [<name>] --path <path_to_priv_key> --no-save
