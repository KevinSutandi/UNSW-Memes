<table>
  <tr>
    <th>Name & Description</th>
    <th>HTTP Method</th>
    <th style="width:18%">Data Types</th>
    <th style="width:32%">Error returns</th>
  </tr>
  <tr>
    <td><code>/auth/login/v2</code><br /><br />Given a registered user's email and password, returns their <code>authUserId</code> value.</td>
    <td style="font-weight: bold; color: blue;">POST</td>
    <td><b>Body Parameters:</b><br /><code>( email, password )</code><br /><br /><b>Return type if no error:</b><br /><code>{ token, authUserId }</code></td>
    <td>
      <b>Return object <code>{error: 'error'}</code></b> when any of:
      <ul>
        <li>email entered does not belong to a user</li>
        <li>password is not correct</li>
      </ul>
    </td>
  </tr>
