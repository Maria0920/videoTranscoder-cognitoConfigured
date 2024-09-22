import React, { Component } from "react";
import { render } from "react-dom";

import speakeasy from "speakeasy";
import QRCode from "qrcode";
import CryptoJS from "crypto-js";

class App extends Component {
  state = {
    image: "",
    secret: "",
    validCode: "",
    isCodeValid: null,
  };

  componentDidMount() {
    // const secret = speakeasy.generateSecret({name: 'Adidas'});
    const secret = {
      ascii: "?:SD%oDD<E!^q^1N):??&QkeqRkhkpt&",
      base32: "H45FGRBFN5CEIPCFEFPHCXRRJYUTUPZ7EZIWWZLRKJVWQ23QOQTA",
      hex: "3f3a5344256f44443c45215e715e314e293a3f3f26516b6571526b686b707426",
      otpauth_url:
        "otpauth://totp/Adidas%Adidas?secret=H45FGRBFN5CEIPCFEFPHCXRRJYUTUPZ7EZIWWZLRKJVWQ23QOQTA",
    };
    // console.log('SECRET -->', secret);

    // Backup codes
    const backupCodes = [];
    const hashedBackupCodes = [];
    // const randomCode = (Math.random() * 10000000000).toFixed();
    // console.log('randomCode -->', randomCode);

    for (let i = 0; i < 10; i++) {
      const randomCode = (Math.random() * 10000000000).toFixed();
      const encrypted = CryptoJS.AES.encrypt(
        randomCode,
        secret.base32
      ).toString();
      backupCodes.push(randomCode);
      hashedBackupCodes.push(encrypted);
    }

    console.log("backupCodes ----->", backupCodes);
    console.log("hashedBackupCodes ----->", hashedBackupCodes);

    // const encrypted = CryptoJS.AES.encrypt(randomCode, secret.base32).toString();
    // console.log('encrypted -->', encrypted)
    // var bytes  = CryptoJS.AES.decrypt(encrypted, secret.base32);
    // var originalText = bytes.toString(CryptoJS.enc.Utf8);
    // console.log('originalText --->', originalText);

    QRCode.toDataURL(secret.otpauth_url, (err, image_data) => {
      this.setState({ image: image_data, secret });
    });
  }

  getCode = () => {
    const { base32, hex } = this.state.secret;
    const code = speakeasy.totp({
      secret: hex,
      encoding: "hex",
      algorithm: "sha1",
    });

    this.setState({ validCode: code });
  };

  verifyCode = () => {
    const { inputValue, secret } = this.state;
    const { base32, hex } = secret;
    const isVerified = speakeasy.totp.verify({
      secret: hex,
      encoding: "hex",
      token: inputValue,
      window: 1,
    });

    console.log("isVerified -->", isVerified);
    this.setState({ isCodeValid: isVerified });
  };

  render() {
    const { image, validCode, isCodeValid } = this.state;
    return (
      <div>
        <img src={`${image}`} />
        {
          // <div>
          //   <h2>{validCode}</h2>
          //   <button onClick={this.getCode}>Get valid code</button>
          // </div>
        }

        <div style={{ marginTop: 20 }}>Verify code</div>
        <input
          type="number"
          onChange={(e) => this.setState({ inputValue: e.target.value })}
        />
        <button onClick={this.verifyCode}>Verify</button>
        {isCodeValid !== null && <div>{isCodeValid ? "✅" : "❌"}</div>}
      </div>
    );
    s;
  }
}

render(<App />, document.getElementById("root"));
