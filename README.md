
[![Build Status](https://api.travis-ci.org/nherment/tornfish.png?branch=master)](https://travis-ci.org/nherment/tornfish)


tornfish
========

Deploy and manage a docker ecosystem from scratch. Get setup in minutes.

Features
  - out of the box docker containers:
    - DNS server
    - Docker private registry
    - node.js easy deployment
  - supports ubuntu
  - [monit](http://mmonit.com/monit/) like monitoring


The basics
----------

> Note on the documentation: tornfish takes options. An option with square brakets around ```[option]``` is optional.
An option with angled brackets around is expecting an input ```-name <container_name>``` --> ```-name "myCustomContainerName"```

tornfish revolves around crud commands that apply to an object type and 'MAY' apply to an object key:

    tornfish add|get|list|delete <type> [<key>]

Note that the use of the word ```add``` instead of ```set``` is voluntary. In some cases, tornfish will reject an
```add``` command if the key already exists. In which case you would need to delete the object first.

The object types are:

- ```config``` represent a configuration item. Configuration is used to define tornfish' global behaviour.
- ```server``` represent an ssh'able server on which tornfish can run scripts
- ```key``` represent SSH keys used by tornfish to connect to servers. Use passphrases with your ssh keys
- ```script``` shell scripts that tornfish runs on the servers

### documentation

Most of the documentation is embedded into tornfish. You can call the following command:

    tornfish help [server|group|key|repository|config] [<key>]


Quick start
-----------

tornfish needs some pre-requisites before taking on your infrastructure

### pre-requisites

#### install node.js

tornfish is written in node.js and requires it to run.

    apt-get install node.js

### install tornfish

    sudo npm install -g tornfish

### setup mongoDB

tornfish saves your commands and infrastructure configuration into mongoDB. We recommend you setup a free mongoDB
instance on [mongohq](https://www.mongohq.com/).

    tornfish add config mongo_host <your_mongodb_host>
    tornfish add config mongo_port <your_mongodb_port>
    tornfish add config mongo_username <your_mongodb_username>
    tornfish add config mongo_password <your_mongodb_password>

> The type ```config``` is the only one that will silently override existing objects if you redefine them.


### your first server

tornfish mainly acts on servers. Because tornfish does not yet support dynamic environments (eg: Amazon ec2) it
assumes that the servers are started before it can connect to it. Tornfish will not automatically discover servers,
start or stop them.

    tornfish add server <host>[:<ssh_port>] server1 --username <user> --generate-key

- ```--username``` asks tornfish to always use this username with this server. You can register multiple users for one
physical servers and tornfish will think that these servers are different.
- ```--generate-key``` asks tornfish to generate a private key and add it to this user's ~/.ssh/authorized_keys so
that tornfish will not ask for a password next time. When this option is used, tornfish will ask you for the server's
password.

If you already have your own private key and would like tornfish to use it, you can use one of these two options:

- ```--use-key <path_to_ssh_priv_key>``` This will use and save the private key into tornfish. tornfish encrypts the keys
with a global password.
- ```--use-external-key <path_to_ssh_priv_key>``` This will ask tornfish to use the key at the given path but the key won't
be saved into tornfish's database.


Commands
--------

    tornfish add config <name> --value <value>

    tornfish add server <name> [--host <hostname|ip>] [--port <ssh_port>] [--user <username>] [--key <sshKeyName>] [--password <password>]

    tornfish set server <name> [--key <key_name>] ...

    tornfish add key [<name>] --path <path_to_priv_key> --no-save

    tornfish list server|key|config|image
    tornfish list key

    tornfish status server <name1> <name2> --all

    tornfish deploy <container> <server> [-v <version>]
