Important Notes ::

Although the website can be opened using File Explorer, in that case the register page will not successfully post to it's expected bouncer.php endpoint; and a corresponding message will show up saying to run the php server.
I recommend using the bouncer.php file I have included.

The functionality in packages is merely placeholder
It does not read from a database, and instead only accepts:
User Id: 'userid'
Password: 'password'

The functionality in contacts is merely placeholder,
and does not actually post its contents anywhere

Instructions ::

1) Open a terminal in the project folder, and type 'php -S localhost:8000'
2) Then, in your browser, go to localhost:8000
3) Go to the register page, and fill out the form correctly
A message should display saying that you have successfully registered
4) Go back to the terminal running your php server
The form contents should now be successfully posted