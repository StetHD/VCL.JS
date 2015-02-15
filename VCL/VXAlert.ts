import VXC = require("./VXComponent");
import VXU = require("./VXUtils");
import V = require("./VCL");

export class TAlert extends VXC.TComponent implements V.iTranslatable {
    constructor(aOwner: VXC.TComponent, renderTo?: string, text?: string) {
        super(aOwner, renderTo);
        this.Visible = false;
        this._text = text;
        (<any>this)._fittowidth = true;
    }

    private _rtl: boolean = false;
    public get Rtl(): boolean {
        return this._rtl;
    }
    public set Rtl(val: boolean) {
        val = V.convertaAnyToBoolean(val);
        if (val != this._rtl) {
            this._rtl = val;
            this.drawDelayed(true);
        }
    }

    private _localizable: boolean = false;
    /**
    * In order to localize application each page or component of the application has to have Localizable property set true.
    */
    public get Localizable(): boolean {
        return this._localizable;
    }
    public set Localizable(val: boolean) {
        val = V.convertaAnyToBoolean(val);
        if (val != this._localizable) {
            this._localizable = val;
            this.drawDelayed(true);
        }
    }



    private _text: string;
    /*
    * Text specify the text string that labels the control.
    */
    public get Text(): string {
        return this._text;
    }
    public set Text(val: string) {
        if (val != this._text) {
            this._text = val;
            this.draw(false);
        }
    }

    private _alertstyle: V.AlertStyle = V.AlertStyle.Default;
    public get AlertStyle(): V.AlertStyle {
        return this._alertstyle;
    }
    public set AlertStyle(val: V.AlertStyle) {
        if (val != this._alertstyle) {
            this._alertstyle = val;
            this.draw(true);
        }
    }

    private _closebuttonvisible: boolean = true;
    public get CloseButtonVisible(): boolean {
        return this._closebuttonvisible;
    }
    public set CloseButtonVisible(val: boolean) {
        val = V.convertaAnyToBoolean(val);
        if (val != this._closebuttonvisible) {
            this._closebuttonvisible = val;
            this.draw(true);
        }
    }

    /*
        Use the OnClick event handler to respond when the user clicks the control. 
    */
    public onClicked: (sender: TAlert) => void;
    private jAlert: JQuery;
    private jBtn: JQuery;
    private jText: JQuery;

    public create() {
        this.jComponent.empty();
        this.jComponent = VXU.VXUtils.changeJComponentType(this.jComponent, 'div', this.FitToWidth, this.FitToHeight);
        this.jComponent.addClass('control-group');
        if (this.Rtl == true) this.jComponent.attr("dir", "RTL");

        this.jAlert = $('<div>');
        this.jAlert.addClass('alert alert-block');
        this.jAlert.appendTo(this.jComponent);

        switch (this.AlertStyle) {
            case V.AlertStyle.Default: break;
            case V.AlertStyle.Info: this.jAlert.addClass("alert-info"); break;
            case V.AlertStyle.Success: this.jAlert.addClass("alert-success"); break;
            case V.AlertStyle.Danger: this.jAlert.addClass("alert-danger"); break;
            case V.AlertStyle.Error: this.jAlert.addClass("alert-error"); break;
        }

        this.jBtn = $('<button />');
        if (this.CloseButtonVisible) {
            this.jBtn.addClass("close");
            this.jBtn.attr('type', 'button');
            this.jBtn.html('&times;');
            this.jBtn.off("click").click(() => {
                this.hide();
                if (this.onClicked != null) (V.tryAndCatch(() => { this.onClicked(this); }))
                return false;
            })

            this.jAlert.append(this.jBtn);
        }
        this.jText = $('<div>');
        this.jText.appendTo(this.jAlert);

        super.create();
    }

    public draw(reCreate: boolean) {
        if (!this.parentInitialized()) return;
        super.draw(reCreate);
        this.jText.html(this.LocalizeText(this.Text));
    }

    public show() {
        this.Visible = true;
    }
}



export class TNotification extends VXC.TComponent implements V.iTranslatable {
    public onClosed: () => void;

    constructor(aOwner: VXC.TComponent, text?: string) {
        super(aOwner, null);
        this.Text = text;
        (<any>this)._fittowidth = true;
    }

    private _alertstyle: V.AlertStyle = V.AlertStyle.Default;
    public get AlertStyle(): V.AlertStyle {
        return this._alertstyle;
    }
    public set AlertStyle(val: V.AlertStyle) {
        if (val != this._alertstyle) {
            this._alertstyle = val;
            this.draw(true);
        }
    }

    private _localizable: boolean = false;
    /**
    * In order to localize application each page or component of the application has to have Localizable property set true.
    */
    public get Localizable(): boolean {
        return this._localizable;
    }
    public set Localizable(val: boolean) {
        val = V.convertaAnyToBoolean(val);
        if (val != this._localizable) {
            this._localizable = val;
            this.drawDelayed(true);
        }
    }


    private _timeout: number = 3000;
    /**
    * Fade alert out after a certain delay (in ms)
    */
    public get Timeout(): number {
        return this._timeout;
    }
    public set Timeout(val: number) {
        val = Number(val);
        if (val != this._timeout) {
            this._timeout = val;
            this.draw(false);
        }
    }


    private _text: string;
    /**
    * Text specify the text string that labels the control.
    */
    public get Text(): string {
        return this._text;
    }
    public set Text(val: string) {
        if (val != this._text) {
            this._text = val;
            this.draw(true);
        }
    }


    private _notifposition: V.NotificationPosition = V.NotificationPosition.TopRight;
    public get NotificationPosition(): V.NotificationPosition {
        return this._notifposition;
    }
    public set NotificationPosition(val: V.NotificationPosition) {
        if (val != this._notifposition) {
            this._notifposition = val;
            this.draw(true);
        }
    }

    public show() {
        if (this.Timeout > 0)
            this.jComponent.delay(this.Timeout).fadeOut('slow', $.proxy(this.close, this));
        if (this.NotificationPosition == V.NotificationPosition.TopLeft) $(".notifications.top-left").append(this.jComponent);
        else if (this.NotificationPosition == V.NotificationPosition.TopRight) $(".notifications.top-right").append(this.jComponent);
        else if (this.NotificationPosition == V.NotificationPosition.BottomLeft) $(".notifications.bottom-left").append(this.jComponent);
        else if (this.NotificationPosition == V.NotificationPosition.BottomRight) $(".notifications.bottom-right").append(this.jComponent);
        this.jComponent.show();
        this.jComponent.alert();
    }

    public hide() {
        this.jComponent.fadeOut('slow', $.proxy(this.close, this));
    }

    private _closebuttonvisible: boolean = true;
    public get CloseButtonVisible(): boolean {
        return this._closebuttonvisible;
    }
    public set CloseButtonVisible(val: boolean) {
        if (val != this._closebuttonvisible) {
            this._closebuttonvisible = val;
            this.draw(true);
        }
    }

    private close() {
        this.jComponent = this.jComponent.detach();
        if (this.onClosed != null) (V.tryAndCatch(() => { this.onClosed(); }));
    }

    private jTopLeft: JQuery;
    private jTopRight: JQuery;
    private jBottomLeft: JQuery;
    private jBottomRight: JQuery;
    public create() {
        if ($(".notifications.top-left").length == 0) $('body').append($("<div>").addClass('notifications top-left'));
        if ($(".notifications.top-right").length == 0) $('body').append($("<div>").addClass('notifications top-right'));
        if ($(".notifications.bottom-left").length == 0) $('body').append($("<div>").addClass('notifications bottom-left'));
        if ($(".notifications.bottom-right").length == 0) $('body').append($("<div>").addClass('notifications bottom-right'));

        this.jComponent.empty();
        this.jComponent = VXU.VXUtils.changeJComponentType(this.jComponent, 'div', this.FitToWidth, this.FitToHeight);
        this.jComponent = $('<div/>').addClass('alert');
        this.jComponent.html(this.LocalizeText(this.Text));
        if (this.CloseButtonVisible) {
            var link = $('<a class="close pull-right" href="#">&times;</a>');
            link.on('click', $.proxy(this.close, this));
            this.jComponent.prepend(link);
        }

        switch (this.AlertStyle) {
            case V.AlertStyle.Default: break;
            case V.AlertStyle.Info: this.jComponent.addClass("alert-info"); break;
            case V.AlertStyle.Success: this.jComponent.addClass("alert-success"); break;
            case V.AlertStyle.Danger: this.jComponent.addClass("alert-danger"); break;
            case V.AlertStyle.Error: this.jComponent.addClass("alert-error"); break;
        }
    }

    public draw(reCreate: boolean) {
        if (!this.parentInitialized()) return;
        super.draw(reCreate);
    }

}