# Moxxy

Moxxy is (or maybe will be) an experimental XMPP client that tries to be as user-friendly and modern (looking)
as possible to minimise friction for users coming from "legacy" messenging services.

## The name

The name comes from my original prototyping name `Modern XMPP Client`. If you shorten it to `MoXC`, it sounds like
`Moxxy`.

## Status

Moxxy is currently not working. You may log in, send and receive messages but it cannot do much more at the moment.

| Description | Image |
| --- | --- |
| Easy registration | ![Easy registration](/assets/readme/easy_register.png) |
| Post easy registration | ![Post easy registration](/assets/readme/post_register.png) |
| Chat overview | ![Chat overview](/assets/readme/conversation_list.png) |
| Chat | ![Chat](/assets/readme/chat.png) |
| Profile overview | ![Profile overview](/assets/readme/profile.png) |
| Roster | ![Roster](/assets/readme/roster.png) |

## Planned Features

### 0.1 Alpha

- Make it generally work (Simple message sending, receiving)
- Store sent files somewhere
- Make the UI look nice
- Make the login more asynchronous
- Clean and lint the code
- Add a licenses page in the setting

### 0.2 Alpha

- Actually implement the settings

### 0.3 Alpha

- Implement push notifications using OpenPush (+ implement a push server)
   - Maybe even use encrypted [push notifications](https://xeps.tigase.net//docs/push-notifications/encrypt/)
- Implement the actual registration (it is currently just stubbed)

### Uncategorized

- Also allow connections using plain TCP (depends on the [XMPP library](https://github.com/legastero/stanza))
- OMEMO
- Groupchats
- Reduce app size

## Links

- [XMPP Providers](https://invent.kde.org/melvo/xmpp-providers/-/tree/master)

## License

See `./LICENSE`