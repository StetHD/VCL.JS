import VXC = require("./VXComponent");
import VXU = require("./VXUtils");
import VXM = require("./VXMenu");

export class TBarBase extends VXC.TComponent {

    public items = new VXM.TMenuItemCollection<VXM.TMenuItem>();
    public createItem(text: string, onClicked?: () => void,gropHeader : string = '~'): VXM.TMenuItem {
        var menuItem = new VXM.TMenuItem();
        menuItem.Text = text;
        menuItem.onClicked = onClicked;
        menuItem.GroupHeader = gropHeader;

        this.items.add(menuItem);
        return menuItem;
    }
}

export class TNavBar extends TBarBase {
    private _piils: boolean = false;
    public get Pills(): boolean {
        return this._piils;
    }
    public set Pills(val: boolean) {
        if (val != this._piils) {
            this._piils = val;
            this.drawDelayed(true);
        }
    }

    /**
    @aOwner     Indicates the component that is responsible for streaming and freeing this component.Onwer must be TContainer
    @renderTo   (Optional) the id of the html element that will be the parent node for this component
    **/
    constructor(aOwner: VXC.TComponent, renderTo?: string) {
        super(aOwner, renderTo);
        (<any>this)._fittowidth = true;
    }


    public create() {
        this.jComponent = VXU.VXUtils.changeJComponentType(this.jComponent, 'div', this.FitToWidth, this.FitToHeight);
        this.jComponent.addClass('navbar');

        var well: JQuery = $("<div>");
        well.addClass('navbar-inner');
        //if (!this.Transparent) well.addClass('well');


        if (this.items.length() > 0) {
            var ulClass = "nav";
            if (this.Pills) ulClass += ' nav-pills';
            var menuItems: JQuery = this.items.createmenu(ulClass);
            menuItems.appendTo(well);

           
        }
        well.appendTo(this.jComponent);
        super.create();

    }

    public draw(reCreate: boolean) {
        if (!this.parentInitialized())return;super.draw(reCreate);

    }
}

export class TSideBar extends TBarBase {
    private _transparent: boolean = true;
    public get Transparent(): boolean {
        return this._transparent;
    }
    public set Transparent(val: boolean) {
        if (val != this._transparent) {
            this._transparent = val;
            this.drawDelayed(true);
        }
    }

    private _header: string = "";
    public get Header(): string {
        return this._header;
    }
    public set Header(val: string) {
        if (val != this._header) {
            this._header = val;
            this.draw(true);
        }
    }

    private createGroupHeader(caption: string): JQuery{
        var head: JQuery = $('<li>').addClass("nav-header");
        head.html(caption);
        return head;

    }

    public create() {
        this.jComponent = VXU.VXUtils.changeJComponentType(this.jComponent, 'div', this.FitToWidth, this.FitToHeight);
        this.jComponent.addClass('sidebar-nav');
        var well: JQuery = $("<div>");
        well.css('padding-top', '8px');
        well.css('padding-right', '0px');
        well.css('padding-left', '0px');
        if (!this.Transparent) well.addClass('well');


        if (this.items.length() > 0) {
            var groups = {}
            this.items.forEach((item) => { if (item.GroupHeader) groups[item.GroupHeader.toUpperCase()] = item.GroupHeader});

            for (var item in groups) {
                var menuItems: JQuery = this.items.createmenu('nav nav-list accordion-group', item);
                var caption = groups[item];
                if (caption == "~") caption = this.Header;
                var head = this.createGroupHeader(caption);
                head.prependTo(menuItems);
                menuItems.appendTo(well);
            }
        }
        well.appendTo(this.jComponent);
        super.create();
    }

    public draw(reCreate: boolean) {
        if (!this.parentInitialized()) return;
        super.draw(reCreate);

    }
}
